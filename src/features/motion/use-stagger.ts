import { type RefCallback, useCallback } from 'react'

import { revealOnEntry } from './reveal-on-entry'
import { useMotion } from './use-motion'

/**
 * Stagger: the children of the list this ref is on come in one after
 * another when it scrolls into view. With reduced motion they are simply
 * there.
 */
export function useStagger<Target extends HTMLElement>(): RefCallback<Target> {
  const { mode, knobs } = useMotion()
  const { entryDistancePx, staggerDelayMs } = knobs
  return useCallback(
    (element: Target | null) => {
      if (element === null || mode === 'reduced') {
        return undefined
      }
      const items = Array.from(element.children).filter(
        (child) => child instanceof HTMLElement,
      )
      return revealOnEntry(element, items, { entryDistancePx, staggerDelayMs })
    },
    [mode, entryDistancePx, staggerDelayMs],
  )
}
