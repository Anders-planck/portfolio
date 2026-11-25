import { sessionIdentity } from '@convex-dev/auth/test'
import { ConvexError } from 'convex/values'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import {
  type AuthBackend,
  createAuthBackend,
  stubLocalOwnerEnv,
  TEST_SIGN_IN_SECRET,
} from './owner.fixture'

afterEach(() => {
  vi.unstubAllEnvs()
})

/** One more owner session on `backend` (another browser, say). */
async function openOwnerSession(backend: AuthBackend) {
  const tokens = await backend.mutation(internal.e2e.signInAsTestOwner, {
    secret: TEST_SIGN_IN_SECRET,
  })
  return {
    owner: backend.withIdentity(sessionIdentity(tokens)),
    sessionId: sessionIdentity(tokens).subject,
  }
}

/** A backend with the owner signed in from two browsers. */
async function createBackendWithTwoSessions() {
  stubLocalOwnerEnv()
  const backend = createAuthBackend()
  const here = await openOwnerSession(backend)
  const elsewhere = await openOwnerSession(backend)
  return { backend, here, elsewhere }
}

describe('owner sessions', () => {
  test('the owner lists every session, the current one marked', async () => {
    const { here, elsewhere } = await createBackendWithTwoSessions()

    const sessions = await here.owner.query(api.sessions.listSessions, {})

    expect(
      sessions.map(({ sessionId, isCurrent }) => ({ sessionId, isCurrent })),
    ).toEqual(
      expect.arrayContaining([
        { sessionId: here.sessionId, isCurrent: true },
        { sessionId: elsewhere.sessionId, isCurrent: false },
      ]),
    )
    expect(sessions).toHaveLength(2)
  })

  test('revoking a session signs that browser out at once', async () => {
    const { here, elsewhere } = await createBackendWithTwoSessions()

    await here.owner.mutation(api.sessions.revokeSession, {
      sessionId: elsewhere.sessionId,
    })

    await expect(
      elsewhere.owner.query(api.sessions.listSessions, {}),
    ).rejects.toThrow(ConvexError)
    expect(await here.owner.query(api.sessions.listSessions, {})).toHaveLength(
      1,
    )
  })

  test('revoking the same session twice ends it once, without an error', async () => {
    const { here, elsewhere } = await createBackendWithTwoSessions()
    const revoke = () =>
      here.owner.mutation(api.sessions.revokeSession, {
        sessionId: elsewhere.sessionId,
      })

    await revoke()
    await expect(revoke()).resolves.toBeNull()
    expect(await here.owner.query(api.sessions.listSessions, {})).toHaveLength(
      1,
    )
  })

  test('a session id that is not the owner’s is left alone', async () => {
    const { here } = await createBackendWithTwoSessions()

    await here.owner.mutation(api.sessions.revokeSession, {
      sessionId: 'someone-else',
    })

    expect(await here.owner.query(api.sessions.listSessions, {})).toHaveLength(
      2,
    )
  })

  test('revoking all sessions signs the owner out everywhere', async () => {
    const { here, elsewhere } = await createBackendWithTwoSessions()

    expect(
      await here.owner.mutation(api.sessions.revokeAllSessions, {}),
    ).toEqual({ revokedCount: 2 })

    for (const session of [here, elsewhere]) {
      await expect(
        session.owner.query(api.sessions.listSessions, {}),
      ).rejects.toThrow(ConvexError)
    }
  })

  test('anonymous callers and removed owners are refused', async () => {
    const { backend, here } = await createBackendWithTwoSessions()

    await expect(backend.query(api.sessions.listSessions, {})).rejects.toThrow(
      ConvexError,
    )
    await expect(
      backend.mutation(api.sessions.revokeAllSessions, {}),
    ).rejects.toThrow(ConvexError)

    vi.stubEnv('OWNER_GITHUB_IDS', '2000002')
    await expect(
      here.owner.mutation(api.sessions.revokeSession, {
        sessionId: here.sessionId,
      }),
    ).rejects.toThrow(ConvexError)
  })
})
