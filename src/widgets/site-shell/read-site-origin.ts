import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

/**
 * The origin the site is served from, for absolute canonical, hreflang and
 * Open Graph URLs. It is the request's own origin, so production, previews
 * and local runs each point at themselves; no domain is configured yet.
 */
export const readSiteOrigin = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin)
