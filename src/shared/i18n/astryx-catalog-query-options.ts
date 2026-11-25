import { queryOptions } from '@tanstack/react-query'

import type { Locale } from './locale'

/** The Astryx locale tag of each site locale (its catalogs are named so). */
export const ASTRYX_LOCALE_TAGS: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en',
  fr: 'fr-FR',
  de: 'de-DE',
}

type AstryxCatalog = Readonly<Record<string, string>>

/**
 * Loads one catalog on demand, so a page ships only the words of its own
 * locale. English is built into Astryx, so it has nothing to load.
 */
const ASTRYX_CATALOG_LOADERS: Record<
  Exclude<Locale, 'en'>,
  () => Promise<{ default: AstryxCatalog }>
> = {
  it: () => import('@astryxdesign/core/locales/it-IT.generated.js'),
  fr: () => import('@astryxdesign/core/locales/fr-FR.generated.js'),
  de: () => import('@astryxdesign/core/locales/de-DE.generated.js'),
}

/** The strings Astryx components show (menu toggles, labels) in a locale. */
export function astryxCatalogQueryOptions(locale: Locale) {
  return queryOptions({
    queryKey: ['astryx-catalog', locale],
    queryFn: async (): Promise<AstryxCatalog> =>
      locale === 'en' ? {} : (await ASTRYX_CATALOG_LOADERS[locale]()).default,
    staleTime: 'static',
  })
}
