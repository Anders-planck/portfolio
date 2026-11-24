// Convex exposes deployment env vars on `process.env` (set with
// `bunx convex env set`). Declared here instead of pulling in @types/node.
declare const process: {
  env: {
    /** HMAC key for preview tokens (content/previewToken.ts). */
    PREVIEW_TOKEN_SECRET?: string
  } & Record<string, string | undefined>
}
