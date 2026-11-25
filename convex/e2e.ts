import { ConvexError, v } from 'convex/values'

import { components } from './_generated/api'
import { internalMutation } from './_generated/server'
import { readOwnerGithubIds, readTestSignInSecret } from './model/env'
import { admitTestOwner } from './model/owner'
import { isSameSecret } from './model/secret'

/**
 * Test-only sign-in, so Playwright can drive the CMS without GitHub. Internal,
 * so no client can call it on any deployment: Playwright runs it with the
 * local backend's admin key (`bunx convex run`). As defence in depth it also
 * refuses every call unless `E2E_SIGN_IN_SECRET` is set and the deployment is
 * a local backend (`readTestSignInSecret`). It signs in as the first
 * allowlisted GitHub id, through the same allowlist as the GitHub sign-in.
 */

const TEST_OWNER_LOGIN = 'e2e-owner'
// Convex Auth's defaults, the same the GitHub sessions get.
const ACCESS_TOKEN_TTL_SECONDS = 60
const SESSION_MAX_LIFETIME_SECONDS = 30 * 24 * 60 * 60

export const signInAsTestOwner = internalMutation({
  args: { secret: v.string() },
  returns: v.object({ accessToken: v.string(), refreshToken: v.string() }),
  handler: async (ctx, { secret }) => {
    const expectedSecret = readTestSignInSecret()
    if (expectedSecret === null || !isSameSecret(secret, expectedSecret)) {
      throw new ConvexError({ kind: 'test-sign-in-disabled' })
    }
    const [githubId] = readOwnerGithubIds()
    if (githubId === undefined) {
      throw new Error('OWNER_GITHUB_IDS has no id to sign in as')
    }
    const userId = await admitTestOwner(
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
