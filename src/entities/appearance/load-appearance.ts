import type { QueryClient } from '@tanstack/react-query'

import { logRecoveredError } from '../../shared/server/log'
import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/**
 * Fills both queries in a loader, so the server renders the first paint with
 * them. The two reads are independent, so a publish between them cannot fail
 * the render; a CSS that cannot be made leaves the page on the built theme
 * (no inline CSS) instead of failing it (the failure is logged), and the browser tries again.
 */
export async function loadAppearance(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.query({ ...appearanceQueryOptions(), staleTime: 'static' }),
    queryClient.query(appearanceCssQueryOptions()).catch((error: unknown) => {
      logRecoveredError('appearance css', error)
    }),
  ])
}
