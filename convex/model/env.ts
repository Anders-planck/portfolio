// The only Convex module that reads deployment env values (ARC-08): convex/
// cannot import src/shared/config/env.ts, so the backend has its own. Values
// are set with `bunx convex env set` and validated here.

declare const process: { env: Record<string, string | undefined> }

/** HMAC key for preview tokens (`model/content/preview.ts`). */
export function readPreviewTokenSecret(): string {
  const secret = process.env.PREVIEW_TOKEN_SECRET
  if (secret === undefined || secret === '') {
    throw new Error('PREVIEW_TOKEN_SECRET is not set in the Convex env')
  }
  return secret
}
