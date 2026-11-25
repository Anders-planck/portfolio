import {
  DEFAULT_LOCALE,
  toLocaleFromPathname,
  toPathnameInLocale,
  toPathnameWithoutLocale,
  toUnprefixedPathname,
} from '../../shared/i18n/locale'
import { findRedirect, type RedirectTarget } from './find-redirect'
import type { RedirectRule } from './redirect-rule'

/** A slash, a backslash or its encoding, once or repeated. */
const SEPARATOR_RUN = /(?:\/|\\|%5c)+/gi

/**
 * One slash between segments and none at the end. Backslashes count as
 * slashes, as browsers read them, so `/it//evil.com` or `/it/\evil.com`
 * can never turn into an address on another site.
 */
function toNormalizedPathname(pathname: string): string {
  const normalized = pathname.replace(SEPARATOR_RUN, '/')
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized
}

/**
 * Where an address belongs, in one hop: slashes normalised, the `/it`
 * prefix dropped (IT has none), and a redirect rule applied to the path
 * without its locale, then put back in that locale. Undefined when the
 * address is already canonical.
 */
export function toCanonicalAddress(
  pathname: string,
  rules: readonly RedirectRule[],
): RedirectTarget | undefined {
  const addressInLocale = toPathnameWithoutLocale(
    toNormalizedPathname(pathname),
    DEFAULT_LOCALE,
  )
  const ruleTarget = findRedirect(toUnprefixedPathname(addressInLocale), rules)
  const canonicalPathname =
    ruleTarget === undefined
      ? addressInLocale
      : toPathnameInLocale(
          ruleTarget.pathname,
          toLocaleFromPathname(addressInLocale),
        )
  if (canonicalPathname === pathname) {
    return undefined
  }
  return {
    pathname: canonicalPathname,
    statusCode: ruleTarget?.statusCode ?? 301,
  }
}
