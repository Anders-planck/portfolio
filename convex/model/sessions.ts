import { ConvexError, type Infer, v } from 'convex/values'

import { components } from '../_generated/api'
import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * The owner's sessions (ADR 0005: listed and revocable). They live in the
 * Convex Auth component; this reads and revokes them for one user only, so a
 * session id of anyone else is never touched.
 */

export const ownerSessionValidator = v.object({
  sessionId: v.string(),
  createdAt: v.number(),
  lastRefreshedAt: v.number(),
  /** The session this call came from. */
  isCurrent: v.boolean(),
})
export type OwnerSession = Infer<typeof ownerSessionValidator>

export async function listOwnerSessions(
  ctx: QueryCtx,
  owner: Doc<'users'>,
): Promise<OwnerSession[]> {
  const identity = await ctx.auth.getUserIdentity()
  const sessions = await ctx.runQuery(components.auth.public.listSessions, {
    userId: owner._id,
  })
  return sessions.map((session) => ({
    sessionId: session.sessionId,
    createdAt: session.creationTime,
    lastRefreshedAt: session.lastRefreshedAt,
    isCurrent: session.sessionId === identity?.subject,
  }))
}

/** Ends one of the owner's sessions; an id that is not theirs is refused. */
export async function revokeOwnerSession(
  ctx: MutationCtx,
  owner: Doc<'users'>,
  sessionId: string,
) {
  const sessions = await listOwnerSessions(ctx, owner)
  if (!sessions.some((session) => session.sessionId === sessionId)) {
    throw new ConvexError({ kind: 'unknown-session' })
  }
  await ctx.runMutation(components.auth.public.revokeSessions, {
    sessionIds: [sessionId],
  })
}

/** Ends every session of the owner, this one included: signed out everywhere. */
export async function revokeAllOwnerSessions(
  ctx: MutationCtx,
  owner: Doc<'users'>,
): Promise<number> {
  const sessions = await listOwnerSessions(ctx, owner)
  const revoked = await ctx.runMutation(components.auth.public.revokeSessions, {
    sessionIds: sessions.map((session) => session.sessionId),
  })
  return revoked.length
}
