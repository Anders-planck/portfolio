import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  readAuthRedirectOrigins,
  readImageTransformOrigin,
  readMediaStorageSettings,
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

describe('readMediaStorageSettings', () => {
  const ACCOUNT_ID = '0123456789abcdef0123456789abcdef'

  function stubStorageEnv(publicOrigin = 'https://media.example.com') {
    vi.stubEnv('R2_ACCOUNT_ID', ACCOUNT_ID)
    vi.stubEnv('R2_BUCKET', 'portfolio-media')
    vi.stubEnv('R2_ACCESS_KEY_ID', 'key-id')
    vi.stubEnv('R2_SECRET_ACCESS_KEY', 'secret')
    vi.stubEnv('MEDIA_PUBLIC_ORIGIN', publicOrigin)
  }

  test('nothing set means storage is not configured', () => {
    expect(readMediaStorageSettings()).toBeNull()
  })

  test('the account id gives the S3 endpoint', () => {
    stubStorageEnv()

    expect(readMediaStorageSettings()).toEqual({
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      bucket: 'portfolio-media',
      accessKeyId: 'key-id',
      secretAccessKey: 'secret',
      publicOrigin: 'https://media.example.com',
    })
  })

  test('only some values set is a configuration error', () => {
    vi.stubEnv('R2_BUCKET', 'portfolio-media')

    expect(() => readMediaStorageSettings()).toThrow('or none')
  })

  test('a public origin with a path or over http is refused', () => {
    stubStorageEnv('http://media.example.com')
    expect(() => readMediaStorageSettings()).toThrow('MEDIA_PUBLIC_ORIGIN')

    stubStorageEnv('https://media.example.com/media')
    expect(() => readMediaStorageSettings()).toThrow('MEDIA_PUBLIC_ORIGIN')
  })

  test('a local fake endpoint is used only on a local backend', () => {
    stubStorageEnv('http://127.0.0.1:3812')
    vi.stubEnv('R2_ENDPOINT', 'http://127.0.0.1:3812')

    vi.stubEnv('CONVEX_CLOUD_URL', 'https://happy-otter-123.convex.cloud')
    expect(() => readMediaStorageSettings()).toThrow()

    vi.stubEnv('CONVEX_CLOUD_URL', 'http://127.0.0.1:3210')
    expect(readMediaStorageSettings()).toMatchObject({
      endpoint: 'http://127.0.0.1:3812',
      publicOrigin: 'http://127.0.0.1:3812',
    })
  })
})

describe('readImageTransformOrigin', () => {
  test('unset means variants are off', () => {
    expect(readImageTransformOrigin()).toBeNull()
  })

  test('a bare https origin is read; anything else is refused', () => {
    vi.stubEnv('IMAGE_TRANSFORM_ORIGIN', 'https://example.com')
    expect(readImageTransformOrigin()).toBe('https://example.com')

    vi.stubEnv('IMAGE_TRANSFORM_ORIGIN', 'https://example.com/cdn-cgi/image')
    expect(() => readImageTransformOrigin()).toThrow('IMAGE_TRANSFORM_ORIGIN')
  })
})
