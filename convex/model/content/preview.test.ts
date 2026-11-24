import { describe, expect, test } from 'vitest'

import {
  type PreviewClaims,
  signPreviewToken,
  verifyPreviewToken,
} from './preview'

const SECRET = 'test-preview-secret'
const NOW = Date.UTC(2026, 10, 24, 12)
const CLAIMS: PreviewClaims = {
  collection: 'profile',
  key: 'main',
  locale: 'it',
  expiresAt: NOW + 60_000,
}

function toBase64UrlFromText(text: string) {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('preview token', () => {
  test('a signed token verifies to its claims before it expires', async () => {
    const token = await signPreviewToken(CLAIMS, SECRET)

    expect(
      await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
    ).toEqual(CLAIMS)
  })

  test('a token reads nothing once it has expired', async () => {
    const token = await signPreviewToken(CLAIMS, SECRET)

    expect(
      await verifyPreviewToken(token, {
        secret: SECRET,
        now: CLAIMS.expiresAt,
      }),
    ).toBeNull()
  })

  test('a token signed with another secret reads nothing', async () => {
    const token = await signPreviewToken(CLAIMS, 'another-secret')

    expect(
      await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
    ).toBeNull()
  })

  test('changing the claims breaks the signature', async () => {
    const token = await signPreviewToken(CLAIMS, SECRET)
    const signature = token.split('.')[1] ?? ''
    const forgedPayload = toBase64UrlFromText(
      JSON.stringify({ ...CLAIMS, locale: 'en' }),
    )

    expect(
      await verifyPreviewToken(`${forgedPayload}.${signature}`, {
        secret: SECRET,
        now: NOW,
      }),
    ).toBeNull()
  })

  test('a genuine token whose claims name an unknown locale reads nothing', async () => {
    const unknownLocale = {
      ...CLAIMS,
      locale: 'xx',
    } as unknown as PreviewClaims
    const token = await signPreviewToken(unknownLocale, SECRET)

    expect(
      await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
    ).toBeNull()
  })

  test.each(['', 'not-a-token', 'a.b.c', 'payload.!!!'])(
    'malformed token %j reads nothing',
    async (token) => {
      expect(
        await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
      ).toBeNull()
    },
  )
})
