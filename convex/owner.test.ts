import { sessionIdentity } from '@convex-dev/auth/test'
import { ConvexError } from 'convex/values'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import {
  type AuthBackend,
  createAuthBackend,
  type SignedInBackend,
  signInAsOwner,
  stubLocalOwnerEnv,
  TEST_OWNER_GITHUB_ID,
  TEST_SIGN_IN_SECRET,
} from './owner.fixture'

const PROFILE = { collection: 'profile', key: 'main' } as const
const PREVIEW_SECRET = 'test-preview-secret-of-at-least-32-bytes'
const OTHER_GITHUB_ID = '2000002'

afterEach(() => {
  vi.unstubAllEnvs()
})

/** One call to every CMS function, as `caller` (ADR 0005: all of them). */
function callEveryCmsFunction(
  caller: AuthBackend | SignedInBackend,
  releaseId: Id<'releases'>,
) {
  return [
    caller.mutation(api.content.saveDraft, {
      ...PROFILE,
      localeEdit: { locale: 'it', content: { subtitle: 'Bozza' } },
    }),
    caller.mutation(api.content.publish, {
      selection: [{ ...PROFILE, revision: 1 }],
      note: '',
      requestId: crypto.randomUUID(),
    }),
    caller.mutation(api.content.rollback, {
      releaseId,
      requestId: crypto.randomUUID(),
    }),
    caller.query(api.content.getEditableDraft, { ...PROFILE, locale: 'it' }),
    caller.mutation(api.content.createPreviewToken, {
      ...PROFILE,
      locale: 'it',
    }),
  ]
}

/** A backend with one published release, and the owner's session on it. */
async function createBackendWithRelease() {
  const backend = createAuthBackend()
  return { backend, ...(await publishFirstRelease(backend)) }
}

/** Publishes one release with a fresh owner session on `backend`. */
async function publishFirstRelease(backend: AuthBackend) {
  const owner = await signInAsOwner(backend)
  vi.stubEnv('PREVIEW_TOKEN_SECRET', PREVIEW_SECRET)
  const { revision } = await owner.mutation(api.content.saveDraft, {
    ...PROFILE,
    localeEdit: { locale: 'it', content: { subtitle: 'Prima' } },
  })
  const outcome = await owner.mutation(api.content.publish, {
    selection: [{ ...PROFILE, revision }],
    note: '',
    requestId: crypto.randomUUID(),
  })
  if (outcome.status !== 'published') {
    throw new Error(`Expected a published release, got ${outcome.status}`)
  }
  return { owner, releaseId: outcome.releaseId }
}

async function expectEveryCallRefused(
  calls: Promise<unknown>[],
  kind: 'signed-out' | 'not-owner',
) {
  const outcomes = await Promise.allSettled(calls)
  expect(outcomes).toHaveLength(5)
  for (const outcome of outcomes) {
    expect(outcome.status).toBe('rejected')
    if (outcome.status === 'rejected') {
      expect(outcome.reason).toBeInstanceOf(ConvexError)
      expect((outcome.reason as ConvexError<{ kind: string }>).data).toEqual({
        kind,
      })
    }
  }
}

describe('requireOwner on every CMS function', () => {
  test('the owner can call every CMS function', async () => {
    const { owner, releaseId } = await createBackendWithRelease()

    const outcomes = await Promise.allSettled(
      callEveryCmsFunction(owner, releaseId),
    )

    expect(outcomes.map((outcome) => outcome.status)).toEqual(
      Array(5).fill('fulfilled'),
    )
  })

  test('an anonymous caller is refused by every CMS function', async () => {
    const { backend, releaseId } = await createBackendWithRelease()

    await expectEveryCallRefused(
      callEveryCmsFunction(backend, releaseId),
      'signed-out',
    )
  })

  test('a signed-in account removed from the allowlist is refused at once', async () => {
    const { owner, releaseId } = await createBackendWithRelease()
    vi.stubEnv('OWNER_GITHUB_IDS', OTHER_GITHUB_ID)

    await expectEveryCallRefused(
      callEveryCmsFunction(owner, releaseId),
      'not-owner',
    )
  })

  test('a signed-out session is refused by every CMS function', async () => {
    const backend = createAuthBackend()
    stubLocalOwnerEnv()
    const tokens = await backend.mutation(internal.e2e.signInAsTestOwner, {
      secret: TEST_SIGN_IN_SECRET,
    })
    const { releaseId } = await publishFirstRelease(backend)
    await backend.mutation(api.auth.signOut, {
      refreshToken: tokens.refreshToken,
    })

    await expectEveryCallRefused(
      callEveryCmsFunction(
        backend.withIdentity(sessionIdentity(tokens)),
        releaseId,
      ),
      'signed-out',
    )
  })

  test('a forged identity without a session is refused', async () => {
    const { backend, releaseId } = await createBackendWithRelease()

    await expectEveryCallRefused(
      callEveryCmsFunction(
        backend.withIdentity({ subject: 'not-a-session' }),
        releaseId,
      ),
      'signed-out',
    )
  })
})

describe('viewer', () => {
  test('anonymous callers are signed out', async () => {
    const backend = createAuthBackend()
    stubLocalOwnerEnv()

    expect(await backend.query(api.users.getViewer, {})).toEqual({
      status: 'signed-out',
    })
  })

  test('the owner sees their login', async () => {
    const owner = await signInAsOwner(createAuthBackend())

    expect(await owner.query(api.users.getViewer, {})).toEqual({
      status: 'owner',
      login: 'e2e-owner',
      name: 'e2e-owner',
    })
  })

  test('an owner removed from the allowlist is not the owner', async () => {
    const owner = await signInAsOwner(createAuthBackend())
    vi.stubEnv('OWNER_GITHUB_IDS', OTHER_GITHUB_ID)

    expect(await owner.query(api.users.getViewer, {})).toEqual({
      status: 'not-owner',
    })
  })
})

describe('GitHub sign-in', () => {
  const githubSignIn = (id: string) => ({
    name: 'github' as const,
    profile: {
      id,
      login: 'someone',
      name: 'Someone',
      emailVerified: true,
      avatarUrl: 'https://avatars.example.com/someone',
    },
  })

  test('an allowlisted account gets one owner user, kept in step', async () => {
    const backend = createAuthBackend()
    stubLocalOwnerEnv()

    const firstId = await backend.mutation(internal.users.admitGithubUser, {
      method: githubSignIn(TEST_OWNER_GITHUB_ID),
    })
    const secondId = await backend.mutation(internal.users.admitGithubUser, {
      method: githubSignIn(TEST_OWNER_GITHUB_ID),
    })

    expect(secondId).toBe(firstId)
    expect(await backend.run((ctx) => ctx.db.get(firstId))).toMatchObject({
      githubId: TEST_OWNER_GITHUB_ID,
      login: 'someone',
      role: 'owner',
    })
  })

  test('an account off the allowlist is refused and gets no user', async () => {
    const backend = createAuthBackend()
    stubLocalOwnerEnv()

    await expect(
      backend.mutation(internal.users.admitGithubUser, {
        method: githubSignIn(OTHER_GITHUB_ID),
      }),
    ).rejects.toThrow(ConvexError)
    expect(await backend.run((ctx) => ctx.db.query('users').take(10))).toEqual(
      [],
    )
  })

  test('a later sign-in of an account removed from the allowlist is refused', async () => {
    const backend = createAuthBackend()
    stubLocalOwnerEnv()
    const userId = await backend.mutation(internal.users.admitGithubUser, {
      method: githubSignIn(TEST_OWNER_GITHUB_ID),
    })
    vi.stubEnv('OWNER_GITHUB_IDS', OTHER_GITHUB_ID)

    await expect(
      backend.mutation(internal.users.readmitGithubUser, {
        method: githubSignIn(TEST_OWNER_GITHUB_ID),
        userId,
      }),
    ).rejects.toThrow(ConvexError)
  })
})
