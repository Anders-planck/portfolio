import { ConvexError } from 'convex/values'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from './_generated/api'
import {
  createAuthBackend,
  stubLocalOwnerEnv,
  TEST_SIGN_IN_SECRET,
} from './owner.fixture'

afterEach(() => {
  vi.unstubAllEnvs()
})

function signInAsTestOwner(secret: string = TEST_SIGN_IN_SECRET) {
  return createAuthBackend().mutation(api.e2e.signInAsTestOwner, { secret })
}

describe('test-only sign-in', () => {
  test('a local backend with the secret set issues an owner session', async () => {
    stubLocalOwnerEnv()

    const tokens = await signInAsTestOwner()

    expect(tokens.accessToken).not.toBe('')
    expect(tokens.refreshToken).not.toBe('')
  })

  test('a cloud deployment refuses it even with the secret set', async () => {
    stubLocalOwnerEnv()
    vi.stubEnv('CONVEX_CLOUD_URL', 'https://happy-otter-123.convex.cloud')

    await expect(signInAsTestOwner()).rejects.toThrow(ConvexError)
  })

  test('it is off when the secret is not set', async () => {
    stubLocalOwnerEnv()
    vi.stubEnv('E2E_SIGN_IN_SECRET', '')

    await expect(signInAsTestOwner()).rejects.toThrow(ConvexError)
  })

  test('a wrong secret is refused', async () => {
    stubLocalOwnerEnv()

    await expect(
      signInAsTestOwner(`wrong-${TEST_SIGN_IN_SECRET}`),
    ).rejects.toThrow(ConvexError)
  })
})
