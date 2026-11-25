import { execFileSync } from 'node:child_process'

import { type Page, test as base } from '@playwright/test'

/** Set in playwright.config.ts (e2e code does not read the environment). */
export interface CmsTestOptions {
  convexUrl: string
  testSignInSecret: string
}

interface SessionTokens {
  accessToken: string
  refreshToken: string
}

/**
 * Tests of the CMS. `ownerPage` is a page whose browser already holds an
 * owner session, from the test-only sign-in of the local backend
 * (convex/e2e.ts), so the tests never go through GitHub.
 */
export const test = base.extend<CmsTestOptions & { ownerPage: Page }>({
  convexUrl: ['', { option: true }],
  testSignInSecret: ['', { option: true }],
  ownerPage: async ({ page, convexUrl, testSignInSecret }, use) => {
    const tokens = signInAsTestOwner(testSignInSecret)
    await page.addInitScript(storeSession, {
      namespace: toStorageNamespace(convexUrl),
      tokens,
    })
    await use(page)
  },
})

function signInAsTestOwner(secret: string): SessionTokens {
  const output = execFileSync(
    'bunx',
    ['convex', 'run', 'e2e:signInAsTestOwner', JSON.stringify({ secret })],
    { encoding: 'utf8', stdio: 'pipe' },
  )
  const tokens: unknown = JSON.parse(output)
  if (!isSessionTokens(tokens)) {
    throw new Error('e2e:signInAsTestOwner returned no session tokens')
  }
  return tokens
}

function isSessionTokens(value: unknown): value is SessionTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    'refreshToken' in value &&
    typeof value.refreshToken === 'string'
  )
}

/**
 * Convex Auth's React provider keys its storage by the deployment URL with
 * every non-alphanumeric character removed (`@convex-dev/auth` browser
 * storage); a change there shows up as these tests landing on Accesso.
 */
function toStorageNamespace(convexUrl: string) {
  return convexUrl.replace(/[^a-zA-Z0-9]/g, '')
}

// Runs in the browser before the app on every navigation, so the provider
// finds the session. Only the first time: later the provider has rotated the
// tokens, and the first ones no longer refresh.
function storeSession({
  namespace,
  tokens,
}: {
  namespace: string
  tokens: SessionTokens
}) {
  const accessTokenKey = `__convexAuthJWT_${namespace}`
  if (window.localStorage.getItem(accessTokenKey) !== null) {
    return
  }
  window.localStorage.setItem(accessTokenKey, tokens.accessToken)
  window.localStorage.setItem(
    `__convexAuthRefreshToken_${namespace}`,
    tokens.refreshToken,
  )
}
