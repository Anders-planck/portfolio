import { type RefCallback, useCallback } from 'react'

import { revealOnEntry } from './reveal-on-entry'
import { useMotionSettings } from './use-motion-settings'

/**
 * Stagger: the children of the list this ref is on come in one after
 * another when it scrolls into view. With reduced motion they are simply
 * there.
 */
export function useStagger<Target extends HTMLElement>(): RefCallback<Target> {
  const { mode, knobs } = useMotionSettings()
  const { entryDistancePx, staggerDelayMs } = knobs
  return useCallback(
    (element: Target | null) => {
      if (element === null || mode === 'reduced') {
        return undefined
      }
      const staggerTargets = Array.from(element.children).filter(
        (child) => child instanceof HTMLElement,
      )
      return revealOnEntry(element, staggerTargets, {
        entryDistancePx,
        staggerDelayMs,
      })
    },
    [mode, entryDistancePx, staggerDelayMs],
  )
}
