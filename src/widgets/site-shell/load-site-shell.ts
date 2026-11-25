import type { QueryClient } from '@tanstack/react-query'

import { loadAppearance } from '../../entities/appearance/load-appearance'
import { astryxCatalogQueryOptions } from '../../shared/i18n/astryx-catalog-query-options'
import { type Locale, toLocaleFromPathname } from '../../shared/i18n/locale'

/**
 * Fills what the shell renders with, for the root loader: the published
 * appearance and the Astryx words of the page's locale. On the server, so the
 * first paint has both. Returns the locale, for the root head.
 */
export async function loadSiteShell(
  queryClient: QueryClient,
  pathname: string,
): Promise<{ locale: Locale }> {
  const locale = toLocaleFromPathname(pathname)
  await Promise.all([
    loadAppearance(queryClient),
    queryClient.query(astryxCatalogQueryOptions(locale)),
  ])
  return { locale }
}
