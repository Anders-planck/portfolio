import { ConvexError, type Infer, v } from 'convex/values'

import { internal } from '../../_generated/api'
import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { readDraftSnapshot } from './drafts'
import { movePublishedPointers } from './pointers'
import {
  documentFindingValidator,
  hasBlockingFinding,
  runPublishRules,
} from './rules'
import type { DocumentRef, Snapshot } from './snapshot'
import { readVersions, writeVersions } from './versions'

/**
 * Releases (ADR 0003): publish freezes the selected drafts into immutable
 * versions, groups them in a release and moves the published pointers, all
 * in one mutation. Blocked publishes are a result the owner sees (DATA-03).
 * Every command carries a `requestId` chosen by the caller: repeating it
 * (double click, retry after a lost response) returns the first release.
 */
const RELEASE_BASE_FIELDS = {
  versionIds: v.array(v.id('versions')),
  note: v.string(),
  requestId: v.string(),
  /** Rule findings at publish: warnings, or the blocks that failed it. */
  findings: v.array(documentFindingValidator),
}

export const releaseValidator = v.union(
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('scheduled'),
    scheduledAt: v.number(),
  }),
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('published'),
    publishedAt: v.number(),
    scheduledAt: v.optional(v.number()),
    /** Set on a rollback: the release whose versions it made live again. */
    rolledBackFrom: v.optional(v.id('releases')),
  }),
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('failed'),
    scheduledAt: v.number(),
    failedAt: v.number(),
  }),
)

export const publishOutcomeValidator = v.union(
  v.object({
    status: v.literal('blocked'),
    findings: v.array(documentFindingValidator),
  }),
  v.object({
    status: v.union(
      v.literal('published'),
      v.literal('scheduled'),
      v.literal('failed'),
    ),
    releaseId: v.id('releases'),
    findings: v.array(documentFindingValidator),
  }),
)
type PublishOutcome = Infer<typeof publishOutcomeValidator>

interface PublishRequest {
  selection: DocumentRef[]
  note: string
  requestId: string
  /** Epoch ms. In the future: schedule the release; omitted or past: now. */
  scheduledAt?: number
}

export async function publishSelection(
  ctx: MutationCtx,
  { selection, note, requestId, scheduledAt }: PublishRequest,
  now: number,
): Promise<PublishOutcome> {
  const repeated = await findReleaseByRequestId(ctx, requestId)
  if (repeated !== null) {
    return toPublishOutcomeFromRelease(repeated)
  }
  const snapshots = await readSelectedDrafts(ctx, selection)
  const findings = runPublishRules(snapshots)
  if (hasBlockingFinding(findings)) {
    return { status: 'blocked', findings }
  }
  const versionIds = await writeVersions(ctx, snapshots, now)
  const releaseFields = { versionIds, note, requestId, findings }
  if (scheduledAt !== undefined && scheduledAt > now) {
    // Versions are frozen now; edits made after scheduling wait for the next
    // publish. The rules run again when the release comes due.
    const releaseId = await ctx.db.insert('releases', {
      ...releaseFields,
      status: 'scheduled',
      scheduledAt,
    })
    await ctx.scheduler.runAt(scheduledAt, internal.content.publishScheduled, {
      releaseId,
    })
    return { status: 'scheduled', releaseId, findings }
  }
  const releaseId = await ctx.db.insert('releases', {
    ...releaseFields,
    status: 'published',
    publishedAt: now,
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
  const { versionIds, note, requestId, scheduledAt } = release
  const versions = await readVersions(ctx, versionIds)
  const findings = runPublishRules(versions.map(({ snapshot }) => snapshot))
  const releaseFields = { versionIds, note, requestId, findings, scheduledAt }
  if (hasBlockingFinding(findings)) {
    await ctx.db.replace(releaseId, {
      ...releaseFields,
      status: 'failed',
      failedAt: now,
    })
    return
  }
  await ctx.db.replace(releaseId, {
    ...releaseFields,
    status: 'published',
    publishedAt: now,
  })
  await movePublishedPointers(ctx, releaseId, versionIds)
}

/**
 * Makes a published release live again: its documents point back at its
 * versions (other documents keep theirs). Recorded as a new release, so a
 * rollback can be rolled back too. Drafts are untouched and rules are not
 * re-run: rollback is the way out when something went wrong.
 */
export async function rollBackToRelease(
  ctx: MutationCtx,
  { targetId, requestId }: { targetId: Id<'releases'>; requestId: string },
  now: number,
) {
  const repeated = await findReleaseByRequestId(ctx, requestId)
  if (repeated !== null) {
    return repeated._id
  }
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
    requestId,
    findings: [],
    status: 'published',
    publishedAt: now,
    rolledBackFrom: targetId,
  })
  await movePublishedPointers(ctx, releaseId, target.versionIds)
  return releaseId
}

function findReleaseByRequestId(ctx: QueryCtx, requestId: string) {
  return ctx.db
    .query('releases')
    .withIndex('by_request_id', (query) => query.eq('requestId', requestId))
    .unique()
}

function toPublishOutcomeFromRelease(release: Doc<'releases'>): PublishOutcome {
  return {
    status: release.status,
    releaseId: release._id,
    findings: release.findings,
  }
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
