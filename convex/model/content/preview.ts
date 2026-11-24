import { isLocale, type Locale } from './locales'
import { type Collection, isCollection } from './snapshot'

/**
 * Signed, expiring preview tokens: `<payload>.<signature>`, both base64url,
 * the signature an HMAC-SHA256 of the payload. Stateless, so preview links
 * need no table and expire on their own. The secret is passed in (it comes
 * from `PREVIEW_TOKEN_SECRET` via `model/env.ts`).
 */
export interface PreviewClaims {
  collection: Collection
  key: string
  locale: Locale
  /** Epoch ms after which the token reads nothing. */
  expiresAt: number
}

export const PREVIEW_TOKEN_TTL_MS = 60 * 60 * 1000

/** A preview token for one document in one locale, valid for an hour from `now`. */
export async function issuePreviewToken(
  target: Omit<PreviewClaims, 'expiresAt'>,
  { secret, now }: { secret: string; now: number },
) {
  const expiresAt = now + PREVIEW_TOKEN_TTL_MS
  const token = await signPreviewToken({ ...target, expiresAt }, secret)
  return { token, expiresAt }
}

export async function signPreviewToken(claims: PreviewClaims, secret: string) {
  const payload = toBase64UrlFromBytes(
    new TextEncoder().encode(JSON.stringify(claims)),
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    await importSigningKey(secret),
    new TextEncoder().encode(payload),
  )
  return `${payload}.${toBase64UrlFromBytes(new Uint8Array(signature))}`
}

/** The token's claims if it is authentic and unexpired at `now`, otherwise null. */
export async function verifyPreviewToken(
  token: string,
  { secret, now }: { secret: string; now: number },
): Promise<PreviewClaims | null> {
  const [payload, signature, ...rest] = token.split('.')
  if (payload === undefined || signature === undefined || rest.length > 0) {
    return null
  }
  const signatureBytes = toBytesFromBase64Url(signature)
  if (signatureBytes === null) {
    return null
  }
  const isAuthentic = await crypto.subtle.verify(
    'HMAC',
    await importSigningKey(secret),
    signatureBytes,
    new TextEncoder().encode(payload),
  )
  if (!isAuthentic) {
    return null
  }
  const claims = parseClaims(payload)
  return claims !== null && claims.expiresAt > now ? claims : null
}

function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function parseClaims(payload: string): PreviewClaims | null {
  const bytes = toBytesFromBase64Url(payload)
  if (bytes === null) {
    return null
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
  return isPreviewClaims(parsed) ? parsed : null
}

// The payload is authenticated before it is parsed; the guard only proves the
// shape this module itself signed.
function isPreviewClaims(value: unknown): value is PreviewClaims {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const claims = value as Record<string, unknown>
  return (
    isCollection(claims.collection) &&
    typeof claims.key === 'string' &&
    isLocale(claims.locale) &&
    typeof claims.expiresAt === 'number'
  )
}

function toBase64UrlFromBytes(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function toBytesFromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
  } catch {
    // Not base64url: the token was not issued by this module.
    return null
  }
}
