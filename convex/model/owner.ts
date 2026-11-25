import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { readOwnerGithubIds } from './env'
import {
  type AccessRefusal,
  isAllowlistedGithubId,
  type OwnerProfile,
  type Viewer,
} from './users'

/**
 * Owner access (ADR 0005). Every CMS query, mutation and action starts with
 * `requireOwner`; sign-ins go through `admitOwner`, so an account off the
 * `OWNER_GITHUB_IDS` allowlist never gets a user row nor a session.
 */

/** The owner's user, or throws: signed out, or no longer on the allowlist. */
export async function requireOwner(ctx: QueryCtx): Promise<Doc<'users'>> {
  const user = await readSignedInUser(ctx)
  if (user === null) {
    throw new ConvexError<AccessRefusal>({ kind: 'signed-out' })
  }
  if (!isAllowlistedGithubId(user.githubId, readOwnerGithubIds())) {
    throw new ConvexError<AccessRefusal>({ kind: 'not-owner' })
  }
  return user
}

/** Who is calling, without throwing: what the CMS shell switches on. */
export async function readViewer(ctx: QueryCtx): Promise<Viewer> {
  const user = await readSignedInUser(ctx)
  if (user === null) {
    return { status: 'signed-out' }
  }
  if (!isAllowlistedGithubId(user.githubId, readOwnerGithubIds())) {
    return { status: 'not-owner' }
  }
  return { status: 'owner', login: user.login, name: user.name }
}

/**
 * Lets an account in at sign-in: refuses one off the allowlist, otherwise
 * returns its user, created on the first sign-in and kept in step with the
 * profile on the next ones. One user per GitHub id, whichever method signs in.
 */
export async function admitOwner(
  ctx: MutationCtx,
  profile: OwnerProfile,
  now: number,
): Promise<Id<'users'>> {
  if (!isAllowlistedGithubId(profile.githubId, readOwnerGithubIds())) {
    throw new ConvexError<AccessRefusal>({ kind: 'not-owner' })
  }
  const existing = await ctx.db
    .query('users')
    .withIndex('by_github_id', (query) =>
      query.eq('githubId', profile.githubId),
    )
    .unique()
  if (existing !== null) {
    await ctx.db.patch(existing._id, profile)
    return existing._id
  }
  return ctx.db.insert('users', { ...profile, role: 'owner', createdAt: now })
}

async function readSignedInUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx)
  return userId === null ? null : ctx.db.get(userId)
}
