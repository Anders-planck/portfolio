import {
  DEFAULT_LOCALE,
  type Locale,
  LOCALES,
  toLocaleFromPathname,
  toPathnameInLocale,
} from '../../shared/i18n/locale'

/** What a page says about itself to search engines and link previews. */
export interface SeoPage {
  /** The site origin, e.g. `https://example.com` (no trailing slash). */
  origin: string
  /** The path of the page, locale prefix included. */
  pathname: string
  siteName: string
  title: string
  description: string
}

export type SeoMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }

export interface SeoLink {
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
 * The head of a page: title, description, canonical, one hreflang link per
 * locale plus `x-default` (the IT page), and Open Graph. Every locale serves
 * every page (a missing translation falls back with a notice), so each page
 * links all four. The router does not merge links: only the route that
 * renders a page may return this head.
 */
export function toSeoHead({
  origin,
  pathname,
  siteName,
  title,
  description,
}: SeoPage): { meta: SeoMeta[]; links: SeoLink[] } {
  const locale = toLocaleFromPathname(pathname)
  const toUrlInLocale = (target: Locale) =>
    `${origin}${toPathnameInLocale(pathname, target)}`
  const canonicalUrl = toUrlInLocale(locale)
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      // No og:locale:alternate: the router keeps one meta per property.
      { property: 'og:locale', content: OPEN_GRAPH_LOCALES[locale] },
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
