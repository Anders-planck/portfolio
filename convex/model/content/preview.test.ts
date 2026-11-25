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
    ).toEqual({ status: 'valid', claims: CLAIMS })
  })

  test('a token is expired from its expiry time on', async () => {
    const token = await signPreviewToken(CLAIMS, SECRET)

    expect(
      await verifyPreviewToken(token, {
        secret: SECRET,
        now: CLAIMS.expiresAt,
      }),
    ).toEqual({ status: 'expired' })
  })

  test('a token signed with another secret is invalid', async () => {
    const token = await signPreviewToken(CLAIMS, 'another-secret')

    expect(
      await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
    ).toEqual({ status: 'invalid' })
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
    ).toEqual({ status: 'invalid' })
  })

  test('a genuine token whose claims name an unknown locale is invalid', async () => {
    const unknownLocale = {
      ...CLAIMS,
      locale: 'xx',
    } as unknown as PreviewClaims
    const token = await signPreviewToken(unknownLocale, SECRET)

    expect(
      await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
    ).toEqual({ status: 'invalid' })
  })

  test.each(['', 'not-a-token', 'a.b.c', 'payload.!!!'])(
    'malformed token %j is invalid',
    async (token) => {
      expect(
        await verifyPreviewToken(token, { secret: SECRET, now: NOW }),
      ).toEqual({ status: 'invalid' })
    },
  )
})
