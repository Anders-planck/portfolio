import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import type { Appearance } from './appearance'
import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/**
 * The published params (live) and their CSS. While the CSS of a new publish
 * loads, the previous CSS stays, so nothing flashes. `loadAppearance` fills
 * both before the first render; if the CSS still cannot load, that is
 * unexpected and goes to the error boundary.
 */
export function useAppearance(): { appearance: Appearance; css: string } {
  const { data: appearance } = useSuspenseQuery(appearanceQueryOptions)
  const { data: css, error } = useQuery(appearanceCssQueryOptions(appearance))
  if (css === undefined) {
    throw error ?? new Error('The appearance CSS was not loaded')
  }
  return { appearance, css }
}
