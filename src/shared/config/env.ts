// The only module that reads environment values (ARC-08): every other module
// imports them from here, already validated.

/** Public URL of the Convex deployment, baked into the build by Vite. */
export function readConvexUrl(): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  if (convexUrl === undefined || convexUrl === '') {
    throw new Error('VITE_CONVEX_URL is not set; see .env.example')
  }
  return convexUrl
}

/**
 * The production origin (`https://example.com`, no path) from the Worker
 * var `SITE_ORIGIN`, or undefined while it is not set (before the domain
 * exists, and in dev). Server only: Workers fill `process.env` from their
 * vars under `nodejs_compat`. A value that is not a bare origin fails loudly.
 */
export function readSiteOriginSetting(): string | undefined {
  const siteOrigin = process.env.SITE_ORIGIN
  if (siteOrigin === undefined || siteOrigin === '') {
    return undefined
  }
  if (!URL.canParse(siteOrigin) || new URL(siteOrigin).origin !== siteOrigin) {
    throw new Error(
      `SITE_ORIGIN must be a bare origin such as https://example.com, got ${siteOrigin}`,
    )
  }
  return siteOrigin
}
