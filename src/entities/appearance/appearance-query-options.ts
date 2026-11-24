import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Appearance } from './appearance'
import { getAppearanceCss } from './get-appearance-css'

/** The published params, live: a publish reaches open pages at once. */
export const appearanceQueryOptions = convexQueryOptions(
  api.appearance.getPublished,
  {},
)

/**
 * The CSS for `appearance`. Keyed by the params, so a publish fetches the new
 * CSS while the page keeps the previous one, and a given key never goes stale.
 * The server reads the params itself; if another publish landed in between,
 * its CSS belongs to another key, so the fetch fails and React Query retries
 * (by then the live params, and so the key, have moved on).
 */
export function appearanceCssQueryOptions(appearance: Appearance) {
  return queryOptions({
    queryKey: ['appearance-css', appearance],
    queryFn: async () => {
      const appearanceCss = await getAppearanceCss()
      if (!isSameAppearance(appearanceCss.appearance, appearance)) {
        throw new Error('The appearance changed while its CSS was made')
      }
      return appearanceCss
    },
    staleTime: 'static',
    placeholderData: keepPreviousData,
  })
}

/** Both come from the same Convex validator, so their JSON has one key order. */
function isSameAppearance(left: Appearance, right: Appearance): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
