import type { QueryClient } from '@tanstack/react-query'

import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/**
 * Fills both queries in a loader, so the server renders the first paint with
 * them. The two reads are independent, so a publish between them cannot fail
 * the render. A CSS that cannot be made leaves the page on the built theme
 * (no inline CSS) instead of failing it, and the browser tries again; the
 * server function has already logged the failure where it happened.
 */
export async function loadAppearance(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.query({ ...appearanceQueryOptions(), staleTime: 'static' }),
    queryClient.query(appearanceCssQueryOptions()).catch(() => undefined),
  ])
}
