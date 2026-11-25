import { ConvexError, type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'

/**
 * Idempotent commands: every publish and rollback carries a caller-chosen
 * `requestId`, stored with its kind on the release it made. Repeating a
 * request returns that release; reusing an id for another kind is a bug.
 */
export const requestKindValidator = v.union(
  v.literal('publish'),
  v.literal('rollback'),
)
export type RequestKind = Infer<typeof requestKindValidator>

/** The release an earlier identical request made, or null for a new request. */
export async function findRepeatedRequest(
  ctx: QueryCtx,
  { requestId, kind }: { requestId: string; kind: RequestKind },
) {
  const release = await ctx.db
    .query('releases')
    .withIndex('by_request_id', (query) => query.eq('requestId', requestId))
    .unique()
  if (release !== null && release.requestKind !== kind) {
    throw new ConvexError({
      code: 'REQUEST_ID_REUSED',
      message: `Request id ${requestId} was already used for a ${release.requestKind}`,
    })
  }
  return release
}
