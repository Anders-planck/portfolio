// The only Convex module that reads deployment env values (ARC-08, ADR 0011).
// convex/ cannot import src/shared/config/env.ts, so the backend has its own.
// Values are set with `bunx convex env set` and validated here.
// (`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` are not read here: convex.config.ts
// binds them to the GitHub OAuth component, which reads them itself.)

import { isLoopbackDeploymentUrl } from './loopback'

declare const process: { env: Record<string, string | undefined> }

/** HMAC-SHA256 wants a key at least as long as its 32-byte output. */
const MIN_PREVIEW_SECRET_BYTES = 32

/** A guessable test sign-in secret would make the local backend trivially open. */
const MIN_TEST_SIGN_IN_SECRET_LENGTH = 32

/** GitHub user ids are positive integers. */
const GITHUB_ID_PATTERN = /^[1-9]\d*$/

/** HMAC key for preview tokens (`model/content/preview.ts`). */
export function readPreviewTokenSecret(): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET
  if (secret === undefined || secret === '') {
    throw new Error('PREVIEW_TOKEN_SECRET is not set in the Convex env')
  }
  if (new TextEncoder().encode(secret).length < MIN_PREVIEW_SECRET_BYTES) {
    throw new Error(
      `PREVIEW_TOKEN_SECRET must be at least ${String(MIN_PREVIEW_SECRET_BYTES)} bytes`,
    )
  }
  return secret
}

/**
 * The GitHub user ids allowed into the CMS (ADR 0005): `OWNER_GITHUB_IDS`,
 * comma-separated numeric ids. Read on every check, so removing an id locks
 * that account out at once.
 */
export function readOwnerGithubIds(): string[] {
  const raw = process.env.OWNER_GITHUB_IDS
  if (raw === undefined || raw.trim() === '') {
    throw new Error('OWNER_GITHUB_IDS is not set in the Convex env')
  }
  const ids = raw.split(',').map((id) => id.trim())
  if (!ids.every((id) => GITHUB_ID_PATTERN.test(id))) {
    throw new Error('OWNER_GITHUB_IDS must be comma-separated GitHub user ids')
  }
  return ids
}

/**
 * Origins the GitHub sign-in may return to (`AUTH_REDIRECT_ORIGINS`,
 * comma-separated bare origins, e.g. `http://localhost:3000,https://example.com`).
 * Read when `auth.ts` loads, where Convex Auth throws on an entry that is not
 * a bare http(s) origin, and a throw there takes every function of the
 * deployment down. So nothing here throws: entries that are not bare http(s)
 * origins are left out, and unset (or nothing valid) allows no origin, which
 * refuses every GitHub sign-in.
 */
export function readAuthRedirectOrigins(): string[] {
  const raw = process.env.AUTH_REDIRECT_ORIGINS ?? ''
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(isBareHttpOrigin)
    .map((entry) => new URL(entry).origin)
}

function isBareHttpOrigin(entry: string) {
  if (!URL.canParse(entry)) {
    return false
  }
  const { protocol, pathname, search, hash } = new URL(entry)
  return (
    (protocol === 'http:' || protocol === 'https:') &&
    pathname === '/' &&
    search === '' &&
    hash === ''
  )
}

/**
 * The secret of the test-only sign-in (`convex/e2e.ts`), or null when that
 * sign-in is off. It is on only when `E2E_SIGN_IN_SECRET` is set AND the
 * deployment is a local backend on a loopback address, so setting the
 * variable on a cloud deployment by mistake still leaves it off.
 */
export function readTestSignInSecret(): string | null {
  const secret = process.env.E2E_SIGN_IN_SECRET
  if (secret === undefined || secret === '') {
    return null
  }
  if (!isLocalBackend()) {
    return null
  }
  if (secret.length < MIN_TEST_SIGN_IN_SECRET_LENGTH) {
    throw new Error(
      `E2E_SIGN_IN_SECRET must be at least ${String(MIN_TEST_SIGN_IN_SECRET_LENGTH)} characters`,
    )
  }
  return secret
}

/** Where media live and how to reach them (`model/media/storage.ts`). */
export interface MediaStorageSettings {
  /** S3 API endpoint of the account, `https://<account>.r2.cloudflarestorage.com`. */
  endpoint: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /** Bare origin that serves the bucket publicly (its custom domain). */
  publicOrigin: string
}

const R2_ACCOUNT_ID_PATTERN = /^[0-9a-f]{32}$/
const R2_BUCKET_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/

/**
 * The R2 bucket and its keys: `R2_ACCOUNT_ID`, `R2_BUCKET`,
 * `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `MEDIA_PUBLIC_ORIGIN`.
 * Null while none is set (Media then says storage is not configured);
 * throws when only some are, or one is malformed.
 * `R2_ENDPOINT` replaces the account's endpoint only for a local fake on a
 * loopback address, and only on a local backend (Playwright).
 */
export function readMediaStorageSettings(): MediaStorageSettings | null {
  const mediaEnv = {
    accountId: process.env.R2_ACCOUNT_ID ?? '',
    bucket: process.env.R2_BUCKET ?? '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    publicOrigin: process.env.MEDIA_PUBLIC_ORIGIN ?? '',
  }
  const mediaEnvEntries = Object.values(mediaEnv)
  if (mediaEnvEntries.every((entry) => entry === '')) {
    return null
  }
  if (mediaEnvEntries.some((entry) => entry === '')) {
    throw new Error(
      'Set all of R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and MEDIA_PUBLIC_ORIGIN, or none',
    )
  }
  if (!R2_ACCOUNT_ID_PATTERN.test(mediaEnv.accountId)) {
    throw new Error('R2_ACCOUNT_ID must be the 32-character account id')
  }
  if (!R2_BUCKET_PATTERN.test(mediaEnv.bucket)) {
    throw new Error('R2_BUCKET must be an R2 bucket name')
  }
  if (!isServingOrigin(mediaEnv.publicOrigin)) {
    throw new Error('MEDIA_PUBLIC_ORIGIN must be a bare https origin')
  }
  const { accessKeyId, secretAccessKey, bucket } = mediaEnv
  return {
    endpoint: readR2Endpoint(mediaEnv.accountId),
    bucket,
    accessKeyId,
    secretAccessKey,
    publicOrigin: new URL(mediaEnv.publicOrigin).origin,
  }
}

/** Whether this backend is a local one, where a local R2 fake may stand in. */
function isLocalBackend() {
  return isLoopbackDeploymentUrl(process.env.CONVEX_CLOUD_URL)
}

function readR2Endpoint(accountId: string) {
  const override = process.env.R2_ENDPOINT
  if (override === undefined || override === '') {
    return `https://${accountId}.r2.cloudflarestorage.com`
  }
  if (!isLoopbackDeploymentUrl(override) || !isLocalBackend()) {
    throw new Error('R2_ENDPOINT is only for a local fake on a local backend')
  }
  return new URL(override).origin
}

/** A bare https origin; on a local backend also the local fake's http one. */
function isServingOrigin(entry: string) {
  if (!isBareHttpOrigin(entry)) {
    return false
  }
  return (
    new URL(entry).protocol === 'https:' ||
    (isLoopbackDeploymentUrl(entry) && isLocalBackend())
  )
}

/**
 * The bare origin of the zone with Image transformations on, which serves
 * `/cdn-cgi/image/…` variants (`IMAGE_TRANSFORM_ORIGIN`, e.g. the site's
 * custom domain). Null while unset: every variant is the original.
 */
export function readImageTransformOrigin(): string | null {
  const origin = process.env.IMAGE_TRANSFORM_ORIGIN
  if (origin === undefined || origin === '') {
    return null
  }
  if (!isBareHttpOrigin(origin) || new URL(origin).protocol !== 'https:') {
    throw new Error('IMAGE_TRANSFORM_ORIGIN must be a bare https origin')
  }
  return new URL(origin).origin
}

/**
 * GitHub token for metric sources (`model/metrics/github.ts`). Optional:
 * public repositories are read without it; a source marked private is not
 * read at all while it is missing.
 */
export function readGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN
  return token === undefined || token === '' ? null : token
}
