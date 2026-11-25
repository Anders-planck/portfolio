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

/** Whether the caller is the owner: the one decision both readers share. */
type OwnerAccess =
  | { status: 'signed-out' }
  | { status: 'not-owner' }
  | { status: 'owner'; user: Doc<'users'> }

/** The owner's user, or throws: signed out, or no longer on the allowlist. */
export async function requireOwner(ctx: QueryCtx): Promise<Doc<'users'>> {
  const access = await readOwnerAccess(ctx)
  if (access.status !== 'owner') {
    throw new ConvexError<AccessRefusal>({ kind: access.status })
  }
  return access.user
}

/** Who is calling, without throwing: what the CMS shell switches on. */
export async function readViewer(ctx: QueryCtx): Promise<Viewer> {
  const access = await readOwnerAccess(ctx)
  if (access.status !== 'owner') {
    return access
  }
  const { login, name } = access.user
  return { status: 'owner', login, name }
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
  const existing = await findAllowlistedUser(ctx, profile.githubId)
  if (existing !== null) {
    await ctx.db.patch(existing._id, profile)
    return existing._id
  }
  return insertOwner(ctx, profile, now)
}

/**
 * The test-only sign-in's way in (`e2e.ts`): the same allowlist, but an
 * existing user keeps its profile, so a test run never renames the owner.
 */
export async function admitTestOwner(
  ctx: MutationCtx,
  profile: OwnerProfile,
  now: number,
): Promise<Id<'users'>> {
  const existing = await findAllowlistedUser(ctx, profile.githubId)
  return existing === null ? insertOwner(ctx, profile, now) : existing._id
}

async function findAllowlistedUser(ctx: MutationCtx, githubId: string) {
  if (!isAllowlistedGithubId(githubId, readOwnerGithubIds())) {
    throw new ConvexError<AccessRefusal>({ kind: 'not-owner' })
  }
  return ctx.db
    .query('users')
    .withIndex('by_github_id', (query) => query.eq('githubId', githubId))
    .unique()
}

function insertOwner(ctx: MutationCtx, profile: OwnerProfile, now: number) {
  return ctx.db.insert('users', { ...profile, role: 'owner', createdAt: now })
}

async function readOwnerAccess(ctx: QueryCtx): Promise<OwnerAccess> {
  const userId = await getAuthUserId(ctx)
  const user = userId === null ? null : await ctx.db.get(userId)
  if (user === null) {
    return { status: 'signed-out' }
  }
  if (!isAllowlistedGithubId(user.githubId, readOwnerGithubIds())) {
    return { status: 'not-owner' }
  }
  return { status: 'owner', user }
}
