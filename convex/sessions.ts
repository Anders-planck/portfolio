import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { requireOwner } from './model/owner'
import {
  listOwnerSessions,
  ownerSessionValidator,
  revokeAllOwnerSessions,
  revokeOwnerSession,
} from './model/sessions'

/**
 * The owner's sessions (ADR 0005). The CMS screen that lists and revokes
 * them comes with ticket 15b (#24).
 */

export const listSessions = query({
  args: {},
  returns: v.array(ownerSessionValidator),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx)
    return listOwnerSessions(ctx, owner)
  },
})

export const revokeSession = mutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const owner = await requireOwner(ctx)
    await revokeOwnerSession(ctx, owner, sessionId)
    return null
  },
})

export const revokeAllSessions = mutation({
  args: {},
  returns: v.object({ revokedCount: v.number() }),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx)
    return { revokedCount: await revokeAllOwnerSessions(ctx, owner) }
  },
})
