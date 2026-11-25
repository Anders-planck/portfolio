import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import {
  ASTRYX_LOCALE_TAGS,
  astryxCatalogQueryOptions,
} from './astryx-catalog-query-options'
import { useLocale } from './use-locale'

/**
 * Gives Astryx components the locale of the page, so their own words (the
 * menu button, close labels) match the site copy. The root loader fills the
 * catalog query, so this never suspends on the server.
 */
export function AstryxLocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocale()
  const { data: catalog } = useSuspenseQuery(astryxCatalogQueryOptions(locale))
  const localeTag = ASTRYX_LOCALE_TAGS[locale]
  return (
    <InternationalizationProvider
      locale={localeTag}
      messages={{ [localeTag]: catalog }}
    >
      {children}
    </InternationalizationProvider>
  )
}
