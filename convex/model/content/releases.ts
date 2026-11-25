import { ConvexError, type Infer, v } from 'convex/values'

import { internal } from '../../_generated/api'
import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { readDraftRevision, readDraftSnapshot } from './drafts'
import { checkPublishLimits } from './limits'
import {
  expectedPointerValidator,
  findPublishedPointer,
  movePublishedPointers,
  readLiveVersionIdsAfter,
} from './pointers'
import { findRepeatedRequest, requestKindValidator } from './requests'
import { readRuleContext } from './rulecontext'
import {
  type DocumentFinding,
  documentFindingValidator,
  hasBlockingFinding,
  PUBLISH_RULES,
  runPublishRules,
} from './rules'
import {
  type DocumentRef,
  documentRefValidator,
  type ReviewedDraft,
  type Snapshot,
} from './snapshot'
import { readVersions, writeVersions } from './versions'

/**
 * Releases (ADR 0003): publish freezes the selected drafts into immutable
 * versions, groups them in a release and moves the published pointers, all
 * in one mutation. Blocked, stale and failed publishes are results the owner
 * sees (DATA-03).
 */
const RELEASE_BASE_FIELDS = {
  versionIds: v.array(v.id('versions')),
  note: v.string(),
  requestId: v.string(),
  requestKind: requestKindValidator,
  /** Rule findings at publish: warnings, or the blocks that failed it. */
  findings: v.array(documentFindingValidator),
}

/** Why a scheduled release did not go live when it came due. */
export const releaseFailureValidator = v.union(
  v.object({ kind: v.literal('rules') }),
  /** These documents were published or rolled back after it was scheduled. */
  v.object({
    kind: v.literal('conflict'),
    documents: v.array(documentRefValidator),
  }),
)

export const releaseValidator = v.union(
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('scheduled'),
    scheduledAt: v.number(),
    /** Each document's pointer when it was scheduled, to detect newer content. */
    expectedPointers: v.array(expectedPointerValidator),
  }),
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('published'),
    publishedAt: v.number(),
    scheduledAt: v.optional(v.number()),
    /** Every live version right after this release: what a rollback restores. */
    liveVersionIds: v.array(v.id('versions')),
    /** Set on a rollback: the release whose site it restored. */
    rolledBackFrom: v.optional(v.id('releases')),
  }),
  v.object({
    ...RELEASE_BASE_FIELDS,
    status: v.literal('failed'),
    scheduledAt: v.number(),
    failedAt: v.number(),
    failure: releaseFailureValidator,
  }),
)

export const publishOutcomeValidator = v.union(
  v.object({
    status: v.literal('blocked'),
    findings: v.array(documentFindingValidator),
  }),
  /** A draft changed after the owner reviewed it: review again, then publish. */
  v.object({
    status: v.literal('stale'),
    documents: v.array(documentRefValidator),
  }),
  v.object({
    status: v.union(v.literal('published'), v.literal('scheduled')),
    releaseId: v.id('releases'),
    findings: v.array(documentFindingValidator),
  }),
  v.object({
    status: v.literal('failed'),
    releaseId: v.id('releases'),
    findings: v.array(documentFindingValidator),
    failure: releaseFailureValidator,
  }),
)
type PublishOutcome = Infer<typeof publishOutcomeValidator>
type ReleaseFailure = Infer<typeof releaseFailureValidator>

interface PublishRequest {
  selection: ReviewedDraft[]
  note: string
  requestId: string
  /** Epoch ms. In the future: schedule the release; omitted or past: now. */
  scheduledAt?: number
}

export async function publishSelection(
  ctx: MutationCtx,
  request: PublishRequest,
  now: number,
): Promise<PublishOutcome> {
  const { selection, note, requestId, scheduledAt } = request
  const repeated = await findRepeatedRequest(ctx, {
    requestId,
    kind: 'publish',
  })
  if (repeated !== null) {
    return toPublishOutcomeFromRelease(repeated)
  }
  checkPublishLimits({ selection, note })
  const staleDocuments = await findStaleDrafts(ctx, selection)
  if (staleDocuments.length > 0) {
    return { status: 'stale', documents: staleDocuments }
  }
  const snapshots = await readSelectedDrafts(ctx, selection)
  const findings = runPublishRules(
    snapshots,
    PUBLISH_RULES,
    await readRuleContext(ctx, snapshots),
  )
  if (hasBlockingFinding(findings)) {
    return { status: 'blocked', findings }
  }
  const versionIds = await writeVersions(ctx, snapshots, now)
  const releaseFields = {
    versionIds,
    note,
    requestId,
    requestKind: 'publish' as const,
    findings,
  }
  if (scheduledAt !== undefined && scheduledAt > now) {
    // Versions are frozen now; edits made after scheduling wait for the next
    // publish. Rules and newer content are checked again when it comes due.
    const releaseId = await ctx.db.insert('releases', {
      ...releaseFields,
      status: 'scheduled',
      scheduledAt,
      expectedPointers: await readCurrentPointers(ctx, selection),
    })
    await ctx.scheduler.runAt(scheduledAt, internal.content.publishScheduled, {
      releaseId,
    })
    return { status: 'scheduled', releaseId, findings }
  }
  const versions = await readVersions(ctx, versionIds)
  const releaseId = await ctx.db.insert('releases', {
    ...releaseFields,
    status: 'published',
    publishedAt: now,
    liveVersionIds: await readLiveVersionIdsAfter(ctx, versions),
  })
  await movePublishedPointers(ctx, releaseId, versions)
  return { status: 'published', releaseId, findings }
}

/**
 * Makes a due scheduled release live, unless a document was published or
 * rolled back since it was scheduled (newer content wins) or a rule now
 * blocks it. Either way it applies all of its documents or none.
 */
export async function publishScheduledRelease(
  ctx: MutationCtx,
  releaseId: Id<'releases'>,
  now: number,
) {
  const release = await ctx.db.get(releaseId)
  if (release?.status !== 'scheduled') {
    return
  }
  const { versionIds, note, requestId, requestKind, scheduledAt } = release
  const versions = await readVersions(ctx, versionIds)
  const snapshots = versions.map(({ snapshot }) => snapshot)
  const findings = runPublishRules(
    snapshots,
    PUBLISH_RULES,
    await readRuleContext(ctx, snapshots),
  )
  const releaseFields = { versionIds, note, requestId, requestKind, findings }
  const conflicts = await findMovedPointers(ctx, release.expectedPointers)
  const failure = toReleaseFailure({ conflicts, findings })
  if (failure !== null) {
    await ctx.db.replace(releaseId, {
      ...releaseFields,
      status: 'failed',
      scheduledAt,
      failedAt: now,
      failure,
    })
    return
  }
  await ctx.db.replace(releaseId, {
    ...releaseFields,
    status: 'published',
    scheduledAt,
    publishedAt: now,
    liveVersionIds: await readLiveVersionIdsAfter(ctx, versions),
  })
  await movePublishedPointers(ctx, releaseId, versions)
}

function toPublishOutcomeFromRelease(release: Doc<'releases'>): PublishOutcome {
  const { _id: releaseId, findings } = release
  if (release.status === 'failed') {
    return { status: 'failed', releaseId, findings, failure: release.failure }
  }
  return { status: release.status, releaseId, findings }
}

/** Newer content wins over rules: a conflict is reported first. */
function toReleaseFailure({
  conflicts,
  findings,
}: {
  conflicts: DocumentRef[]
  findings: DocumentFinding[]
}): ReleaseFailure | null {
  if (conflicts.length > 0) {
    return { kind: 'conflict', documents: conflicts }
  }
  return hasBlockingFinding(findings) ? { kind: 'rules' } : null
}

async function findStaleDrafts(
  ctx: QueryCtx,
  selection: ReviewedDraft[],
): Promise<DocumentRef[]> {
  const revisions = await Promise.all(
    selection.map((draft) => readDraftRevision(ctx, draft)),
  )
  return selection
    .filter((draft, index) => {
      const revision = revisions[index]
      // A missing draft is not stale: readSelectedDrafts reports it.
      return revision !== null && revision !== draft.revision
    })
    .map(({ collection, key }) => ({ collection, key }))
}

async function readCurrentPointers(ctx: QueryCtx, selection: DocumentRef[]) {
  return Promise.all(
    selection.map(async ({ collection, key }) => {
      const pointer = await findPublishedPointer(ctx, { collection, key })
      return { collection, key, releaseId: pointer?.releaseId ?? null }
    }),
  )
}

async function findMovedPointers(
  ctx: QueryCtx,
  expectedPointers: Infer<typeof expectedPointerValidator>[],
): Promise<DocumentRef[]> {
  const current = await readCurrentPointers(ctx, expectedPointers)
  return current
    .filter(
      (pointer, index) =>
        pointer.releaseId !== expectedPointers[index]?.releaseId,
    )
    .map(({ collection, key }) => ({ collection, key }))
}

// The CMS only offers documents that have a draft, so a missing one is a
// programming error, not a result the owner has to handle.
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
