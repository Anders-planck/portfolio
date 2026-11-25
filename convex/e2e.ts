import { ConvexError, v } from 'convex/values'

import { components } from './_generated/api'
import { mutation } from './_generated/server'
import { readOwnerGithubIds, readTestSignInSecret } from './model/env'
import { admitOwner } from './model/owner'

/**
 * Test-only sign-in, so Playwright can drive the CMS without GitHub. It works
 * only on a local backend with `E2E_SIGN_IN_SECRET` set (see
 * `readTestSignInSecret`); on every other deployment it refuses every call.
 * It signs in as the first allowlisted GitHub id, through the same
 * `admitOwner` as the GitHub sign-in.
 */

const TEST_OWNER_LOGIN = 'e2e-owner'
// Convex Auth's defaults, the same the GitHub sessions get.
const ACCESS_TOKEN_TTL_SECONDS = 60
const SESSION_MAX_LIFETIME_SECONDS = 30 * 24 * 60 * 60

export const signInAsTestOwner = mutation({
  args: { secret: v.string() },
  returns: v.object({ accessToken: v.string(), refreshToken: v.string() }),
  handler: async (ctx, { secret }) => {
    const expectedSecret = readTestSignInSecret()
    if (expectedSecret === null || secret !== expectedSecret) {
      throw new ConvexError({ kind: 'test-sign-in-disabled' })
    }
    const [githubId] = readOwnerGithubIds()
    if (githubId === undefined) {
      throw new Error('OWNER_GITHUB_IDS has no id to sign in as')
    }
    const userId = await admitOwner(
      ctx,
      { githubId, login: TEST_OWNER_LOGIN, name: TEST_OWNER_LOGIN },
      Date.now(),
    )
    // The public sign-in methods of Convex Auth cannot be extended yet, so
    // this issues the session through the core component directly.
    const { accessToken, refreshToken } = await ctx.runMutation(
      components.auth.public._internal_dangerous_signIn,
      {
        userId,
        claims: { method: 'e2e', profile: {} },
        componentPath: 'auth',
        accessTokenTtlSeconds: ACCESS_TOKEN_TTL_SECONDS,
        refreshInactivityTimeoutSeconds: SESSION_MAX_LIFETIME_SECONDS,
        sessionMaxLifetimeSeconds: SESSION_MAX_LIFETIME_SECONDS,
      },
    )
    return { accessToken, refreshToken }
  },
})
