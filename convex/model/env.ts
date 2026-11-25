// The only Convex module that reads deployment env values (ARC-08, ADR 0011).
// convex/ cannot import src/shared/config/env.ts, so the backend has its own.
// Values are set with `bunx convex env set` and validated here.
// (`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` are not read here: convex.config.ts
// binds them to the GitHub OAuth component, which reads them itself.)

import { isLoopbackDeploymentUrl } from './e2e'

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
 * comma-separated, e.g. `http://localhost:3000,https://example.com`).
 * Read when `auth.ts` loads, so a missing value must not throw: that would
 * take the whole deployment down. Unset means no origin is allowed and every
 * GitHub sign-in is refused.
 */
export function readAuthRedirectOrigins(): string[] {
  const raw = process.env.AUTH_REDIRECT_ORIGINS ?? ''
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
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
  if (!isLoopbackDeploymentUrl(process.env.CONVEX_CLOUD_URL)) {
    return null
  }
  if (secret.length < MIN_TEST_SIGN_IN_SECRET_LENGTH) {
    throw new Error(
      `E2E_SIGN_IN_SECRET must be at least ${String(MIN_TEST_SIGN_IN_SECRET_LENGTH)} characters`,
    )
  }
  return secret
}
