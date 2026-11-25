import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  readAuthRedirectOrigins,
  readOwnerGithubIds,
  readTestSignInSecret,
} from './env'

const LONG_SECRET = 'a-test-sign-in-secret-of-32-chars!'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('readOwnerGithubIds', () => {
  test('reads comma-separated GitHub ids, spaces allowed', () => {
    vi.stubEnv('OWNER_GITHUB_IDS', '1000001, 2000002')

    expect(readOwnerGithubIds()).toEqual(['1000001', '2000002'])
  })

  test('an unset or empty allowlist is a configuration error', () => {
    vi.stubEnv('OWNER_GITHUB_IDS', ' ')

    expect(() => readOwnerGithubIds()).toThrow('OWNER_GITHUB_IDS is not set')
  })

  test('a login instead of a numeric id is refused', () => {
    vi.stubEnv('OWNER_GITHUB_IDS', '1000001,Anders-planck')

    expect(() => readOwnerGithubIds()).toThrow('GitHub user ids')
  })
})

describe('readAuthRedirectOrigins', () => {
  test('reads comma-separated origins, trimmed', () => {
    vi.stubEnv(
      'AUTH_REDIRECT_ORIGINS',
      'http://localhost:3000 , https://example.com,',
    )

    expect(readAuthRedirectOrigins()).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ])
  })

  test('entries that are not bare http(s) origins are left out, not thrown', () => {
    vi.stubEnv(
      'AUTH_REDIRECT_ORIGINS',
      'https://example.com/cms,myapp://callback,not a url,https://ok.example.com/,https://q.example.com?x=1',
    )

    expect(readAuthRedirectOrigins()).toEqual(['https://ok.example.com'])
  })

  test('unset means no origin, without throwing at module load', () => {
    vi.stubEnv('AUTH_REDIRECT_ORIGINS', undefined)

    expect(readAuthRedirectOrigins()).toEqual([])
  })
})

describe('readTestSignInSecret', () => {
  test('on a local backend with the secret set, the sign-in is on', () => {
    vi.stubEnv('CONVEX_CLOUD_URL', 'http://127.0.0.1:3210')
    vi.stubEnv('E2E_SIGN_IN_SECRET', LONG_SECRET)

    expect(readTestSignInSecret()).toBe(LONG_SECRET)
  })

  test('a cloud deployment keeps it off even with the secret set', () => {
    vi.stubEnv('CONVEX_CLOUD_URL', 'https://happy-otter-123.convex.cloud')
    vi.stubEnv('E2E_SIGN_IN_SECRET', LONG_SECRET)

    expect(readTestSignInSecret()).toBeNull()
  })

  test('a short secret on a local backend is a configuration error', () => {
    vi.stubEnv('CONVEX_CLOUD_URL', 'http://127.0.0.1:3210')
    vi.stubEnv('E2E_SIGN_IN_SECRET', 'short')

    expect(() => readTestSignInSecret()).toThrow('at least 32')
  })
})
