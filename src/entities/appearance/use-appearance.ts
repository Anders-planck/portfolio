import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { type Appearance, isSameAppearance } from './appearance'
import {
  appearanceCssQueryOptions,
  appearanceQueryOptions,
} from './appearance-query-options'

/**
 * The published params (live) and the last good CSS made from them. When a
 * publish moves the params past the CSS, the CSS is fetched again and the
 * previous one stays meanwhile, so nothing flashes; if that fetch fails, the
 * previous one stays. `css` is undefined only while no CSS was ever made:
 * the page then renders with the built theme.
 */
export function useAppearance(): {
  appearance: Appearance
  css: string | undefined
} {
  const { data: appearance } = useSuspenseQuery(appearanceQueryOptions())
  const { data: appearanceCss, refetch } = useQuery(appearanceCssQueryOptions())
  const isCssBehind =
    appearanceCss !== undefined &&
    !isSameAppearance(appearanceCss.appearance, appearance)

  // Syncs the CSS with the live params, which Convex pushes.
  useEffect(() => {
    if (isCssBehind) {
      void refetch()
    }
  }, [isCssBehind, appearance, refetch])

  return { appearance, css: appearanceCss?.css }
}
