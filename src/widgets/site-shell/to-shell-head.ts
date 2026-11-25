import { isNotFound } from '@tanstack/react-router'

import type { Locale } from '../../shared/i18n/locale'
import { toNotFoundHead } from './to-not-found-head'

/** The part of a router match the shell head reads. */
interface MatchStatus {
  status: string
  error?: unknown
  /** Set by the router on the route that shows the 404 when nothing matched. */
  _notFound?: boolean
}

/**
 * Whether the router is showing the 404 page: a route (the locale segment, a
 * missing project) said it does not exist, or nothing matched. The root
 * route keeps status `success` for its 404: a thrown not-found is its
 * error, an address nothing matched only sets the router's `_notFound` flag
 * (the one it serialises as `globalNotFound`; no public field says it).
 */
export function hasNotFoundMatch(matches: readonly MatchStatus[]): boolean {
  return matches.some(
    (match) =>
      match.status === 'notFound' ||
      isNotFound(match.error) ||
      match._notFound === true,
  )
}

/**
 * The meta every page has, for the root route's `head`; on the 404 page also
 * its title. Page titles, canonical and hreflang come from the page's own
 * route (`toPageHead`). `locale` is the address's: on a 404 no match may
 * carry it.
 */
export function toShellHead(matches: readonly MatchStatus[], locale: Locale) {
  return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...(hasNotFoundMatch(matches) ? toNotFoundHead(locale).meta : []),
    ],
  }
}
