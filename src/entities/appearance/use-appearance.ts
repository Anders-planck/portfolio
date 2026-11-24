import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/**
 * The published colour mode and the CSS of the published params. After
 * `loadAppearance` both are there on the first render; while a new publish
 * loads, the CSS of the previous one stays, so nothing flashes.
 */
export function useAppearance() {
  const { data: appearance } = useSuspenseQuery(appearanceQueryOptions)
  const { data: css = '' } = useQuery(appearanceCssQueryOptions(appearance))
  return { mode: appearance.theme.mode, css }
}
