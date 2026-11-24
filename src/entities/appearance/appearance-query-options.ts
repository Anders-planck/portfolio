import {
  keepPreviousData,
  type QueryClient,
  queryOptions,
} from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Appearance } from './appearance-css'
import { getAppearanceCss } from './get-appearance-css'

/** The published params, live: a publish reaches open pages at once. */
export const appearanceQueryOptions = convexQueryOptions(
  api.appearance.getPublished,
  {},
)

/**
 * The CSS for `appearance`. Keyed by the params, so a publish fetches the new
 * CSS while the page keeps the previous one; a given key never goes stale.
 */
export function appearanceCssQueryOptions(appearance: Appearance) {
  return queryOptions({
    queryKey: ['appearance-css', appearance],
    queryFn: () => getAppearanceCss(),
    staleTime: 'static',
    placeholderData: keepPreviousData,
  })
}

/** Fills both queries in a loader, so the server renders the first paint with them. */
export async function loadAppearance(queryClient: QueryClient): Promise<void> {
  const appearance = await queryClient.query({
    ...appearanceQueryOptions,
    staleTime: 'static',
  })
  await queryClient.query(appearanceCssQueryOptions(appearance))
}
