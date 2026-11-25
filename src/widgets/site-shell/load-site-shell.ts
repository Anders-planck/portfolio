import type { QueryClient } from '@tanstack/react-query'

import { loadAppearance } from '../../entities/appearance/load-appearance'
import { profileQueryOptions } from '../../entities/profile/profile-query-options'
import { astryxCatalogQueryOptions } from '../../shared/i18n/astryx-catalog-query-options'
import { type Locale, toLocaleFromPathname } from '../../shared/i18n/locale'
import type { SiteOrigin } from './site-origin'
import { siteOriginQueryOptions } from './site-origin-query-options'

/**
 * Fills what the shell renders with, for the root loader: the published
 * appearance, the Astryx words of the page's locale, the site origin and
 * the published Profile (the footer's contacts). On
 * the server, so the first paint has them; on a client navigation the next
 * locale's words load before the page changes. Returns what the root head
 * needs.
 */
export async function loadSiteShell(
  queryClient: QueryClient,
  pathname: string,
): Promise<{ locale: Locale; siteOrigin: SiteOrigin }> {
  const locale = toLocaleFromPathname(pathname)
  const [siteOrigin] = await Promise.all([
    queryClient.query(siteOriginQueryOptions()),
    loadAppearance(queryClient),
    queryClient.query(astryxCatalogQueryOptions(locale)),
    queryClient.query({ ...profileQueryOptions(locale), staleTime: 'static' }),
  ])
  return { locale, siteOrigin }
}
