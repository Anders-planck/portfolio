import { ConvexError, v } from 'convex/values'
import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import {
  internalMutation,
  type MutationCtx,
  type QueryCtx,
  query,
} from '../_generated/server'
import { requireOwner } from '../lib/requireOwner'
import { readDraft, vDraftEdit, writeDraft } from './drafts'
import { vLocale } from './locales'
import {
  PREVIEW_TOKEN_TTL_MS,
  signPreviewToken,
  verifyPreviewToken,
} from './previewToken'
import { blocks, runRules, vDocumentFinding } from './rules'
import {
  type Collection,
  localize,
  type Snapshot,
  vCollection,
  vLocalizedDocument,
} from './snapshot'

/**
 * Content store (ADR 0003). The whole interface:
 * - `saveDraft`: live-save an edit to a document's draft.
 * - `publish(selection, note, at?)`: snapshot the selected drafts into
 *   immutable versions, run the rules, group them in a release and move the
 *   published pointers, now or at `at`.
 * - `rollback(releaseId)`: point the release's documents back at its versions.
 * - `getPublished(collection, key, locale)`: what the public site reads.
 * - `getDraft(token)`: what preview reads, behind a signed expiring token.
 */

const vDocumentRef = v.object({ collection: vCollection, key: v.string() })

export const saveDraft = internalMutation({
  args: vDraftEdit,
  returns: v.object({ savedAt: v.number() }),
  handler: async (ctx, edit) => {
    await requireOwner(ctx)
    const savedAt = Date.now()
    await writeDraft(ctx, edit, savedAt)
    return { savedAt }
  },
})

export const publish = internalMutation({
  args: {
    selection: v.array(vDocumentRef),
    note: v.string(),
    /** Epoch ms. In the future: schedule the release; omitted or past: now. */
    at: v.optional(v.number()),
  },
  returns: v.union(
    v.object({
      status: v.literal('blocked'),
      findings: v.array(vDocumentFinding),
    }),
    v.object({
      status: v.union(v.literal('published'), v.literal('scheduled')),
      releaseId: v.id('releases'),
      findings: v.array(vDocumentFinding),
    }),
  ),
  handler: async (ctx, { selection, note, at }) => {
    await requireOwner(ctx)
    const snapshots = await readSelection(ctx, selection)
    const findings = runRules(snapshots)
    if (blocks(findings)) {
      return { status: 'blocked' as const, findings }
    }

    const now = Date.now()
    const versionIds = await writeVersions(ctx, snapshots, now)

    if (at !== undefined && at > now) {
      // The versions are frozen now; edits made after scheduling wait for
      // the next publish. Rules run again when the release comes due.
      const releaseId = await ctx.db.insert('releases', {
        versionIds,
        note,
        status: 'scheduled',
        scheduledAt: at,
        findings,
      })
      await ctx.scheduler.runAt(at, internal.content.store.runScheduled, {
        releaseId,
      })
      return { status: 'scheduled' as const, releaseId, findings }
    }

    const releaseId = await ctx.db.insert('releases', {
      versionIds,
      note,
      status: 'published',
      publishedAt: now,
      findings,
    })
    await movePointers(ctx, releaseId, versionIds)
    return { status: 'published' as const, releaseId, findings }
  },
})

/** Scheduler target: makes a scheduled release live unless a rule now blocks it. */
export const runScheduled = internalMutation({
  args: { releaseId: v.id('releases') },
  returns: v.null(),
  handler: async (ctx, { releaseId }) => {
    const release = await ctx.db.get(releaseId)
    if (release?.status !== 'scheduled') return null

    const snapshots: Snapshot[] = []
    for (const versionId of release.versionIds) {
      const version = await ctx.db.get(versionId)
      if (!version) throw new Error(`Missing version ${versionId}`)
      snapshots.push(version.snapshot)
    }
    const findings = runRules(snapshots)
    if (blocks(findings)) {
      await ctx.db.patch(releaseId, { status: 'failed', findings })
      return null
    }

    await ctx.db.patch(releaseId, {
      status: 'published',
      publishedAt: Date.now(),
      findings,
    })
    await movePointers(ctx, releaseId, release.versionIds)
    return null
  },
})

async function writeVersions(
  ctx: MutationCtx,
  snapshots: Snapshot[],
  now: number,
) {
  const versionIds: Id<'versions'>[] = []
  for (const snapshot of snapshots) {
    versionIds.push(
      await ctx.db.insert('versions', {
        collection: snapshot.collection,
        key: snapshot.key,
        snapshot,
        createdAt: now,
      }),
    )
  }
  return versionIds
}

/**
 * Make a published release live again: its documents point back at its
 * versions (other documents keep theirs). Recorded as a new release, so a
 * rollback can be rolled back too. Drafts are untouched and rules are not
 * re-run: rollback is the way out when something went wrong.
 */
export const rollback = internalMutation({
  args: { releaseId: v.id('releases') },
  returns: v.object({ releaseId: v.id('releases') }),
  handler: async (ctx, { releaseId: targetId }) => {
    await requireOwner(ctx)
    const target = await ctx.db.get(targetId)
    if (target?.status !== 'published') {
      throw new ConvexError({
        code: 'NOT_ROLLBACKABLE',
        message: 'Only a published release can be rolled back to',
      })
    }
    const releaseId = await ctx.db.insert('releases', {
      versionIds: target.versionIds,
      note: `Rollback: ${target.note}`,
      status: 'published',
      publishedAt: Date.now(),
      rolledBackFrom: targetId,
      findings: [],
    })
    await movePointers(ctx, releaseId, target.versionIds)
    return { releaseId }
  },
})

export const getPublished = query({
  args: { collection: vCollection, key: v.string(), locale: vLocale },
  returns: v.union(vLocalizedDocument, v.null()),
  handler: async (ctx, { collection, key, locale }) => {
    const pointer = await findPointer(ctx, collection, key)
    if (!pointer) return null
    const version = await ctx.db.get(pointer.versionId)
    if (!version) return null
    return localize(version.snapshot, locale)
  },
})

/** A preview link for one document in one locale, valid for an hour. */
export const createPreviewToken = internalMutation({
  args: { collection: vCollection, key: v.string(), locale: vLocale },
  returns: v.object({ token: v.string(), expiresAt: v.number() }),
  handler: async (ctx, { collection, key, locale }) => {
    await requireOwner(ctx)
    const expiresAt = Date.now() + PREVIEW_TOKEN_TTL_MS
    const token = await signPreviewToken({
      collection,
      key,
      locale,
      exp: expiresAt,
    })
    return { token, expiresAt }
  },
})

/** The draft a preview token was issued for; null if the token is bad or expired. */
export const getDraft = query({
  args: { token: v.string() },
  returns: v.union(vLocalizedDocument, v.null()),
  handler: async (ctx, { token }) => {
    const claims = await verifyPreviewToken(token, Date.now())
    if (!claims) return null
    const snapshot = await readDraft(ctx, claims.collection, claims.key)
    return snapshot ? localize(snapshot, claims.locale) : null
  },
})

async function readSelection(
  ctx: QueryCtx,
  selection: { collection: Collection; key: string }[],
): Promise<Snapshot[]> {
  const snapshots: Snapshot[] = []
  for (const { collection, key } of selection) {
    const snapshot = await readDraft(ctx, collection, key)
    if (!snapshot) {
      throw new ConvexError({
        code: 'NO_DRAFT',
        message: `No draft for ${collection}/${key}`,
      })
    }
    snapshots.push(snapshot)
  }
  return snapshots
}

function findPointer(ctx: QueryCtx, collection: Collection, key: string) {
  return ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (q) =>
      q.eq('collection', collection).eq('key', key),
    )
    .unique()
}

async function movePointers(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  versionIds: Id<'versions'>[],
) {
  for (const versionId of versionIds) {
    const version = await ctx.db.get(versionId)
    if (!version) throw new Error(`Missing version ${versionId}`)
    const { collection, key } = version
    const pointer = await findPointer(ctx, collection, key)
    if (pointer) {
      await ctx.db.patch(pointer._id, { versionId, releaseId })
    } else {
      await ctx.db.insert('publishedPointers', {
        collection,
        key,
        versionId,
        releaseId,
      })
    }
  }
}
