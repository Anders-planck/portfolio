import type { Locale } from './locales'
import type { Collection } from './snapshot'

/**
 * Signed, expiring preview tokens: `<payload>.<signature>`, both base64url,
 * the signature an HMAC-SHA256 of the payload with `PREVIEW_TOKEN_SECRET`.
 * Stateless, so preview links need no table and expire on their own.
 */
export type PreviewClaims = {
  collection: Collection
  key: string
  locale: Locale
  /** Expiry, epoch ms. */
  exp: number
}

export const PREVIEW_TOKEN_TTL_MS = 60 * 60 * 1000

export async function signPreviewToken(claims: PreviewClaims) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(claims)))
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(),
    new TextEncoder().encode(payload),
  )
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`
}

/** The token's claims if it is authentic and unexpired, otherwise null. */
export async function verifyPreviewToken(
  token: string,
  now: number,
): Promise<PreviewClaims | null> {
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length > 0) return null

  let signatureBytes: Uint8Array<ArrayBuffer>
  try {
    signatureBytes = fromBase64Url(signature)
  } catch {
    return null
  }
  const authentic = await crypto.subtle.verify(
    'HMAC',
    await signingKey(),
    signatureBytes,
    new TextEncoder().encode(payload),
  )
  if (!authentic) return null

  const claims = JSON.parse(
    new TextDecoder().decode(fromBase64Url(payload)),
  ) as PreviewClaims
  return claims.exp > now ? claims : null
}

async function signingKey() {
  const secret = process.env.PREVIEW_TOKEN_SECRET
  if (!secret) {
    throw new Error('PREVIEW_TOKEN_SECRET is not set in the Convex env')
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string) {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}
