import { isNotFound } from '@tanstack/react-router'

import type { Locale } from '../../shared/i18n/locale'
import type { SiteOrigin } from './site-origin'
import { toAddressHead } from './to-address-head'
import { toNotFoundHead } from './to-not-found-head'

/** The part of a router match the shell head reads. */
interface MatchState {
  status: string
  pathname: string
  error?: unknown
}

/**
 * Whether the router is showing the 404 page: a route (the locale segment,
 * the catch-all `{-$locale}/$`, a missing project) threw not-found. The
 * route that shows it either has status `notFound` or, for the root, keeps
 * `success` with the not-found as its error.
 */
export function hasNotFoundMatch(matches: readonly MatchState[]): boolean {
  return matches.some(
    (match) => match.status === 'notFound' || isNotFound(match.error),
  )
}

/**
 * The root route's `head`: the meta of every page and the address part of
 * the page on screen, or the 404 title. Titles and descriptions come from
 * the page's own route (`toPageHead`). `shell` is what the root loader
 * returned (the address's locale: on a 404 no match may carry it); without
 * it only the shared meta is known.
 */
export function toShellHead({
  matches,
  shell,
}: {
  matches: readonly MatchState[]
  shell: { locale: Locale; siteOrigin: SiteOrigin } | undefined
}) {
  const sharedMeta = [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ]
  if (shell === undefined) {
    return { meta: sharedMeta, links: [] }
  }
  const { locale, siteOrigin } = shell
  if (hasNotFoundMatch(matches)) {
    return { meta: [...sharedMeta, ...toNotFoundHead(locale).meta], links: [] }
  }
  const address = toAddressHead({
    siteOrigin,
    pathname: matches.at(-1)?.pathname ?? '/',
  })
  return { meta: [...sharedMeta, ...address.meta], links: address.links }
}
