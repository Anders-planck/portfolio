import { redirect } from '@tanstack/react-router'

import { DEFAULT_LOCALE, toPathnameWithoutLocale } from './locale'

/**
 * For the root route's `beforeLoad`: IT is the default locale and has no
 * prefix, so `/it/…` moves for good to the same page without it. In the
 * root, because a deeper route never loads for an address nothing matches.
 */
export function redirectFromDefaultLocalePrefix(location: {
  pathname: string
  searchStr: string
}): void {
  const unprefixedPathname = toPathnameWithoutLocale(
    location.pathname,
    DEFAULT_LOCALE,
  )
  if (unprefixedPathname === location.pathname) {
    return
  }
  // `throw: true` makes the router throw its own redirect object.
  redirect({
    href: `${unprefixedPathname}${location.searchStr}`,
    statusCode: 301,
    throw: true,
  })
}
