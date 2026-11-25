// The only Convex module that reads deployment env values (ARC-08, ADR 0011).
// convex/ cannot import src/shared/config/env.ts, so the backend has its own.
// Values are set with `bunx convex env set` and validated here.

declare const process: { env: Record<string, string | undefined> }

/** HMAC-SHA256 wants a key at least as long as its 32-byte output. */
const MIN_PREVIEW_SECRET_BYTES = 32

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
 * GitHub token for metric sources (`model/metrics/github.ts`). Optional:
 * public repositories are read without it; a source marked private is not
 * read at all while it is missing.
 */
export function readGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN
  return token === undefined || token === '' ? null : token
}
