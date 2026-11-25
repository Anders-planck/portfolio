/// <reference types="vite/client" />
import githubTest from '@convex-dev/auth/components/github/test'
import authTest, { sessionIdentity } from '@convex-dev/auth/test'
import { convexTest } from 'convex-test'
import { vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

/**
 * Test backends for functions behind `requireOwner` (ADR 0005). The owner
 * signs in through the test-only sign-in (`e2e.ts`), so every test holds a
 * real Convex Auth session, as the CMS does.
 */

const modules = import.meta.glob('./**/*.ts')

export const TEST_OWNER_GITHUB_ID = '1000001'
export const TEST_SIGN_IN_SECRET = 'test-sign-in-secret-of-32-characters'
export const LOCAL_BACKEND_URL = 'http://127.0.0.1:3210'

export type AuthBackend = ReturnType<typeof createAuthBackend>
export type SignedInBackend = Awaited<ReturnType<typeof signInAsOwner>>

/** A backend with the Convex Auth components mounted, nobody signed in. */
export function createAuthBackend() {
  const backend = convexTest(schema, modules)
  authTest.registerCore(backend)
  githubTest.registerGithubOauth(backend)
  return backend
}

/** The env of a local backend whose owner is `TEST_OWNER_GITHUB_ID`. */
export function stubLocalOwnerEnv() {
  vi.stubEnv('OWNER_GITHUB_IDS', TEST_OWNER_GITHUB_ID)
  vi.stubEnv('E2E_SIGN_IN_SECRET', TEST_SIGN_IN_SECRET)
  vi.stubEnv('CONVEX_CLOUD_URL', LOCAL_BACKEND_URL)
}

/** Signs the owner in; returns the backend as that session calls it. */
export async function signInAsOwner(backend: AuthBackend) {
  stubLocalOwnerEnv()
  const tokens = await backend.mutation(api.e2e.signInAsTestOwner, {
    secret: TEST_SIGN_IN_SECRET,
  })
  return backend.withIdentity(sessionIdentity(tokens))
}

/** A backend and the owner's session on it, for tests that only edit. */
export async function createOwnerBackend() {
  return signInAsOwner(createAuthBackend())
}
