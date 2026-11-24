import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'
import type { AppearanceCss } from './get-appearance-css'

/**
 * The CSS of the published params and the colour mode it was made with, so
 * the two always match. While a new publish loads, the previous pair stays,
 * so nothing flashes. `loadAppearance` fills it before the first render; if
 * the CSS still cannot load, that is unexpected and goes to the error boundary.
 */
export function useAppearance(): AppearanceCss {
  const { data: appearance } = useSuspenseQuery(appearanceQueryOptions)
  const { data, error } = useQuery(appearanceCssQueryOptions(appearance))
  if (data === undefined) {
    throw error ?? new Error('The appearance CSS was not loaded')
  }
  return data
}
