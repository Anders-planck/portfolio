/** Site locales. IT is the default: it is served without a prefix. */
export const LOCALES = ['it', 'en', 'fr', 'de'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE = 'it' satisfies Locale

/** The locales that live under a path prefix (`/en`, `/fr`, `/de`). */
export type PrefixedLocale = Exclude<Locale, typeof DEFAULT_LOCALE>

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

export function isPrefixedLocale(value: string): value is PrefixedLocale {
  return isLocale(value) && value !== DEFAULT_LOCALE
}

/** The first path segment, without slashes ('' for the home page). */
export function readFirstSegment(pathname: string): string {
  return pathname.split('/').find((segment) => segment !== '') ?? ''
}

/** The locale a page is in: its prefix, or IT when it has none. */
export function toLocaleFromPathname(pathname: string): Locale {
  const firstSegment = readFirstSegment(pathname)
  return isPrefixedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE
}

/**
 * The path without its first segment when that segment is `locale`:
 * `/en/lavori` without `en` → `/lavori`; any other path stays as it is.
 */
export function toPathnameWithoutLocale(
  pathname: string,
  locale: Locale,
): string {
  const firstSegment = readFirstSegment(pathname)
  if (firstSegment !== locale) {
    return pathname
  }
  const rest = pathname.slice(
    pathname.indexOf(firstSegment) + firstSegment.length,
  )
  return rest === '' ? '/' : rest
}

/** The path of a page without its locale prefix: `/en/lavori` → `/lavori`. */
export function toUnprefixedPathname(pathname: string): string {
  const firstSegment = readFirstSegment(pathname)
  return isPrefixedLocale(firstSegment)
    ? toPathnameWithoutLocale(pathname, firstSegment)
    : pathname
}

/** The same page in another locale: `/en/lavori` in FR → `/fr/lavori`. */
export function toPathnameInLocale(pathname: string, locale: Locale): string {
  const unprefixedPathname = toUnprefixedPathname(pathname)
  if (locale === DEFAULT_LOCALE) {
    return unprefixedPathname
  }
  return unprefixedPathname === '/'
    ? `/${locale}`
    : `/${locale}${unprefixedPathname}`
}

/**
 * The full address of the same page in another locale, query string and
 * anchor kept, so switching language never moves the reader.
 */
export function toHrefInLocale(
  location: { pathname: string; searchStr: string; hash: string },
  locale: Locale,
): string {
  const anchor = location.hash === '' ? '' : `#${location.hash}`
  return `${toPathnameInLocale(location.pathname, locale)}${location.searchStr}${anchor}`
}
