import {
  type GithubProfile,
  vGithubProfile,
} from '@convex-dev/auth/methods/github/server'
import { v } from 'convex/values'

import { internalMutation, query } from './_generated/server'
import { admitOwner, readViewer } from './model/owner'
import type { OwnerProfile } from './model/users'
import { viewerValidator } from './model/users'

/**
 * Users of the CMS (ADR 0005): the GitHub sign-in callbacks of Convex Auth
 * (`auth.ts`) and the viewer the CMS shell reads.
 */

const githubSignInValidator = v.object({
  name: v.literal('github'),
  profile: vGithubProfile,
})

/** Convex Auth's `createUser` for GitHub: refuses accounts off the allowlist. */
export const admitGithubUser = internalMutation({
  args: { method: githubSignInValidator },
  returns: v.id('users'),
  handler: (ctx, { method }) =>
    admitOwner(
      ctx,
      toOwnerProfileFromGithubProfile(method.profile),
      Date.now(),
    ),
})

/**
 * Convex Auth's `onSignIn` for GitHub: runs on every sign-in, so an account
 * removed from the allowlist gets no new session, and the profile stays fresh.
 */
export const readmitGithubUser = internalMutation({
  args: { method: githubSignInValidator, userId: v.id('users') },
  returns: v.null(),
  handler: async (ctx, { method }) => {
    await admitOwner(
      ctx,
      toOwnerProfileFromGithubProfile(method.profile),
      Date.now(),
    )
    return null
  },
})

/** Who is calling: signed out, signed in but not the owner, or the owner. */
export const getViewer = query({
  args: {},
  returns: viewerValidator,
  handler: (ctx) => readViewer(ctx),
})

function toOwnerProfileFromGithubProfile(profile: GithubProfile): OwnerProfile {
  const { id, login, name, avatarUrl } = profile
  return {
    githubId: id,
    login,
    name: name ?? login,
    ...(avatarUrl === undefined ? {} : { avatarUrl }),
  }
}
