import { ConvexError } from 'convex/values'

import type { Id } from '../../_generated/dataModel'
import type { MutationCtx } from '../../_generated/server'
import { replaceLiveSite } from './pointers'
import { findRepeatedRequest } from './requests'

/**
 * Restores the site as it was right after a published release: every
 * document goes back to the version it had then, and documents first
 * published later are unpublished. Recorded as a new release (with
 * `rolledBackFrom`), so a rollback can be rolled back too. Drafts are
 * untouched and rules are not re-run: rollback is the way out when
 * something went wrong.
 */
export async function rollBackToRelease(
  ctx: MutationCtx,
  { targetId, requestId }: { targetId: Id<'releases'>; requestId: string },
  now: number,
) {
  const repeated = await findRepeatedRequest(ctx, {
    requestId,
    kind: 'rollback',
  })
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
  const { liveVersionIds, note } = target
  const releaseId = await ctx.db.insert('releases', {
    versionIds: liveVersionIds,
    note,
    requestId,
    requestKind: 'rollback',
    findings: [],
    status: 'published',
    publishedAt: now,
    liveVersionIds,
    rolledBackFrom: targetId,
  })
  await replaceLiveSite(ctx, releaseId, liveVersionIds)
  return releaseId
}
