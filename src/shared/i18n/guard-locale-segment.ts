import { notFound, redirect } from '@tanstack/react-router'

import { DEFAULT_LOCALE, isPrefixedLocale, readFirstSegment } from './locale'

/**
 * For the root route's `beforeLoad`: IT is the default locale and has no
 * prefix, so `/it/…` moves for good to the same page without it. In the
 * root, because a deeper route never loads for an address nothing matches.
 */
export function redirectFromDefaultLocalePrefix(location: {
  pathname: string
  searchStr: string
}): void {
  if (readFirstSegment(location.pathname) !== DEFAULT_LOCALE) {
    return
  }
  const unprefixedPathname = location.pathname.slice(
    `/${DEFAULT_LOCALE}`.length,
  )
  // `throw: true` makes the router throw its own redirect object.
  redirect({
    href: `${unprefixedPathname === '' ? '/' : unprefixedPathname}${location.searchStr}`,
    statusCode: 301,
    throw: true,
  })
}

/**
 * For the `{-$locale}` route's `beforeLoad`: no segment or `en`, `fr`, `de`
 * pass; any other first segment is a page that does not exist.
 */
export function guardLocaleSegment(segment: string | undefined): void {
  if (segment === undefined || isPrefixedLocale(segment)) {
    return
  }
  notFound({ throw: true })
}
