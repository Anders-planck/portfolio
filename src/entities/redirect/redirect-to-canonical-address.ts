import { redirect } from '@tanstack/react-router'

import type { RedirectRule } from './redirect-rule'
import { toCanonicalAddress } from './to-canonical-address'

/**
 * For the root route's `beforeLoad` (a deeper route never loads for an
 * address nothing matches): when the address is not canonical, throws the
 * router redirect, query string kept, and the server answers with its
 * status code. Otherwise returns and the page loads.
 */
export function redirectToCanonicalAddress(
  location: { pathname: string; searchStr: string },
  rules: readonly RedirectRule[],
): void {
  const target = toCanonicalAddress(location.pathname, rules)
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
