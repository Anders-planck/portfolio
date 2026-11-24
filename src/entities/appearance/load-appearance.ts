import type { QueryClient } from '@tanstack/react-query'

import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/** Fills both queries in a loader, so the server renders the first paint with them. */
export async function loadAppearance(queryClient: QueryClient): Promise<void> {
  const appearance = await queryClient.query({
    ...appearanceQueryOptions,
    staleTime: 'static',
  })
  await queryClient.query(appearanceCssQueryOptions(appearance))
}
