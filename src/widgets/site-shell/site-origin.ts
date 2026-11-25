/** Where the site's absolute URLs point, and whether search engines may index. */
export interface SiteOrigin {
  /** The origin of canonical, hreflang and Open Graph URLs. */
  canonicalOrigin: string
  /** Only the configured production host is indexed; previews are not. */
  isIndexable: boolean
}

/**
 * The configured `SITE_ORIGIN` when there is one, else the request's own
 * origin (dev and previews before the domain exists). A host other than the
 * configured one (a `*.workers.dev` preview, localhost) is never indexed;
 * without a configured origin nothing is.
 */
export function toSiteOrigin({
  configuredOrigin,
  requestOrigin,
}: {
  configuredOrigin: string | undefined
  requestOrigin: string
}): SiteOrigin {
  return {
    canonicalOrigin: configuredOrigin ?? requestOrigin,
    isIndexable: configuredOrigin === requestOrigin,
  }
}
