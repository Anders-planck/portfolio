import {
  DEFAULT_LOCALE,
  type Locale,
  LOCALES,
  toLocaleFromPathname,
  toPathnameInLocale,
} from '../../shared/i18n/locale'
import type { SiteOrigin } from './site-origin'

export type AddressMeta =
  { name: string; content: string } | { property: string; content: string }

export interface AddressLink {
  rel: 'canonical' | 'alternate'
  href: string
  hrefLang?: string
}

/** Open Graph wants language and territory. */
const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  it: 'it_IT',
  en: 'en_GB',
  fr: 'fr_FR',
  de: 'de_DE',
}

/**
 * The part of a page's head that depends on its address: canonical, one
 * hreflang link per locale plus `x-default` (the IT page), `og:url` and
 * `og:locale`, and `noindex` off the production host. Every locale serves
 * every page (a missing translation falls back with a notice), so each page
 * links all four. The router does not merge links, so only the root route
 * returns this.
 */
export function toAddressHead({
  siteOrigin,
  pathname,
}: {
  siteOrigin: SiteOrigin
  pathname: string
}): { meta: AddressMeta[]; links: AddressLink[] } {
  const locale = toLocaleFromPathname(pathname)
  const toUrlInLocale = (target: Locale) =>
    `${siteOrigin.canonicalOrigin}${toPathnameInLocale(pathname, target)}`
  const canonicalUrl = toUrlInLocale(locale)
  return {
    meta: [
      { property: 'og:url', content: canonicalUrl },
      // No og:locale:alternate: the router keeps one meta per property.
      { property: 'og:locale', content: OPEN_GRAPH_LOCALES[locale] },
      ...(siteOrigin.isIndexable
        ? []
        : [{ name: 'robots', content: 'noindex' }]),
    ],
    links: [
      { rel: 'canonical', href: canonicalUrl },
      ...LOCALES.map((other) => ({
        rel: 'alternate' as const,
        hrefLang: other,
        href: toUrlInLocale(other),
      })),
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: toUrlInLocale(DEFAULT_LOCALE),
      },
    ],
  }
}
