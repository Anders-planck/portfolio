import { queryOptions } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import { getAppearanceCss } from './get-appearance-css'

/** The published params, live: a publish reaches open pages at once. */
export const appearanceQueryOptions = convexQueryOptions(
  api.appearance.getPublished,
  {},
)

/**
 * The CSS of the published params, with the params the server made it from.
 * One key, so a refetch that fails keeps the last good CSS. `useAppearance`
 * refetches when the live params move past it.
 */
export const appearanceCssQueryOptions = queryOptions({
  queryKey: ['appearance-css'],
  queryFn: () => getAppearanceCss(),
  staleTime: 'static',
})
