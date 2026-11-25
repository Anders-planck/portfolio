import { redirect } from '@tanstack/react-router'

import { findRedirect } from './find-redirect'
import type { RedirectRule } from './redirect-rule'

/**
 * For a route's `beforeLoad`: when a rule matches the address, throws the
 * router redirect (the server answers with the rule's status code), keeping
 * the query string. Otherwise returns and the page loads.
 */
export function applyRedirectRules(
  location: { pathname: string; searchStr: string },
  rules: readonly RedirectRule[],
): void {
  const target = findRedirect(location.pathname, rules)
  if (target === undefined) {
    return
  }
  // `throw: true` makes the router throw its own redirect object.
  redirect({
    href: `${target.pathname}${location.searchStr}`,
    statusCode: target.statusCode,
    throw: true,
  })
}
