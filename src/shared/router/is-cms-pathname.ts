/** Where the CMS lives; it is not localized and is no page of the site. */
export const CMS_PATHNAME = '/cms'

/**
 * Whether an address is in the CMS: the site shell (header, footer, the
 * site's canonical and hreflang links) stays off it.
 */
export function isCmsPathname(pathname: string): boolean {
  return pathname === CMS_PATHNAME || pathname.startsWith(`${CMS_PATHNAME}/`)
}
