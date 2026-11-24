import { ConvexError, v } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { readDraftSnapshot } from './drafts'
import type { Locale } from './locales'
import {
  type DocumentFinding,
  documentFindingValidator,
  hasBlockingFinding,
  runPublishRules,
} from './rules'
import {
  type DocumentRef,
  type LocalizedDocument,
  type Snapshot,
  toLocalizedDocumentFromSnapshot,
} from './snapshot'

/**
 * Releases (ADR 0003): publish freezes the selected drafts into immutable
 * versions, groups them in a release and moves the published pointers, all
 * in one mutation. Blocked publishes are a result the owner sees (DATA-03).
 */
export const publishOutcomeValidator = v.union(
  v.object({
    status: v.literal('blocked'),
    findings: v.array(documentFindingValidator),
  }),
  v.object({
    status: v.union(v.literal('published'), v.literal('scheduled')),
    releaseId: v.id('releases'),
    findings: v.array(documentFindingValidator),
  }),
)

type PublishOutcome =
  | { status: 'blocked'; findings: DocumentFinding[] }
  | {
      status: 'published' | 'scheduled'
      releaseId: Id<'releases'>
      findings: DocumentFinding[]
    }

interface PublishRequest {
  selection: DocumentRef[]
  note: string
  /** Epoch ms. In the future: schedule the release; omitted or past: now. */
  at?: number
}

export async function publishSelection(
  ctx: MutationCtx,
  { selection, note, at }: PublishRequest,
  now: number,
): Promise<PublishOutcome> {
  const snapshots = await readSelectedDrafts(ctx, selection)
  const findings = runPublishRules(snapshots)
  if (hasBlockingFinding(findings)) {
    return { status: 'blocked', findings }
  }
  const versionIds = await writeVersions(ctx, snapshots, now)
  if (at !== undefined && at > now) {
    // Versions are frozen now; edits made after scheduling wait for the next
    // publish. The rules run again when the release comes due.
    const releaseId = await ctx.db.insert('releases', {
      versionIds,
      note,
      status: 'scheduled',
      scheduledAt: at,
      findings,
    })
    return { status: 'scheduled', releaseId, findings }
  }
  const releaseId = await ctx.db.insert('releases', {
    versionIds,
    note,
    status: 'published',
    publishedAt: now,
    findings,
  })
  await movePublishedPointers(ctx, releaseId, versionIds)
  return { status: 'published', releaseId, findings }
}

/** Makes a due scheduled release live, unless a rule now blocks it. */
export async function publishScheduledRelease(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  now: number,
) {
  const release = await ctx.db.get(releaseId)
  if (release?.status !== 'scheduled') {
    return
  }
  const versions = await readVersions(ctx, release.versionIds)
  const findings = runPublishRules(versions.map(({ snapshot }) => snapshot))
  if (hasBlockingFinding(findings)) {
    await ctx.db.patch(releaseId, { status: 'failed', findings })
    return
  }
  await ctx.db.patch(releaseId, {
    status: 'published',
    publishedAt: now,
    findings,
  })
  await movePublishedPointers(ctx, releaseId, release.versionIds)
}

/**
 * Makes a published release live again: its documents point back at its
 * versions (other documents keep theirs). Recorded as a new release, so a
 * rollback can be rolled back too. Drafts are untouched and rules are not
 * re-run: rollback is the way out when something went wrong.
 */
export async function rollBackToRelease(
  ctx: MutationCtx,
  targetId: Id<'releases'>,
  now: number,
) {
  const target = await ctx.db.get(targetId)
  if (target?.status !== 'published') {
    throw new ConvexError({
      code: 'NOT_ROLLBACKABLE',
      message: 'Only a published release can be rolled back to',
    })
  }
  const releaseId = await ctx.db.insert('releases', {
    versionIds: target.versionIds,
    note: target.note,
    status: 'published',
    publishedAt: now,
    rolledBackFrom: targetId,
    findings: [],
  })
  await movePublishedPointers(ctx, releaseId, target.versionIds)
  return releaseId
}

/** What the public site shows for a document in a locale, or null. */
export async function readPublishedDocument(
  ctx: QueryCtx,
  ref: DocumentRef,
  locale: Locale,
): Promise<LocalizedDocument | null> {
  const pointer = await findPublishedPointer(ctx, ref)
  if (pointer === null) {
    return null
  }
  const version = await ctx.db.get(pointer.versionId)
  return version === null
    ? null
    : toLocalizedDocumentFromSnapshot(version.snapshot, locale)
}

async function readSelectedDrafts(
  ctx: QueryCtx,
  selection: DocumentRef[],
): Promise<Snapshot[]> {
  return Promise.all(
    selection.map(async (ref) => {
      const snapshot = await readDraftSnapshot(ctx, ref)
      if (snapshot === null) {
        throw new ConvexError({
          code: 'NO_DRAFT',
          message: `No draft for ${ref.collection}/${ref.key}`,
        })
      }
      return snapshot
    }),
  )
}

async function writeVersions(
  ctx: MutationCtx,
  snapshots: Snapshot[],
  now: number,
) {
  return Promise.all(
    snapshots.map((snapshot) =>
      ctx.db.insert('versions', {
        collection: snapshot.collection,
        key: snapshot.key,
        snapshot,
        createdAt: now,
      }),
    ),
  )
}

async function readVersions(
  ctx: QueryCtx,
  versionIds: Id<'versions'>[],
): Promise<Doc<'versions'>[]> {
  return Promise.all(
    versionIds.map(async (versionId) => {
      const version = await ctx.db.get(versionId)
      if (version === null) {
        // Versions are immutable and never deleted; a release cannot lose one.
        throw new Error(`Missing version ${versionId}`)
      }
      return version
    }),
  )
}

function findPublishedPointer(ctx: QueryCtx, { collection, key }: DocumentRef) {
  return ctx.db
    .query('publishedPointers')
    .withIndex('by_collection_and_key', (query) =>
      query.eq('collection', collection).eq('key', key),
    )
    .unique()
}

async function movePublishedPointers(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  versionIds: Id<'versions'>[],
) {
  const versions = await readVersions(ctx, versionIds)
  for (const { _id: versionId, collection, key } of versions) {
    const pointer = await findPublishedPointer(ctx, { collection, key })
    if (pointer === null) {
      await ctx.db.insert('publishedPointers', {
        collection,
        key,
        versionId,
        releaseId,
      })
    } else {
      await ctx.db.patch(pointer._id, { versionId, releaseId })
    }
  }
}
