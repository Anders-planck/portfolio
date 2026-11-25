import { type RefCallback, useCallback } from 'react'

import { revealOnEntry } from './reveal-on-entry'
import { useMotionSettings } from './use-motion-settings'

/**
 * Reveal: the block this ref is on fades and lifts in when it scrolls into
 * view. With reduced motion it is simply there.
 */
export function useReveal<Target extends HTMLElement>(): RefCallback<Target> {
  const { mode, knobs } = useMotionSettings()
  const { entryDistancePx } = knobs
  return useCallback(
    (element: Target | null) => {
      if (element === null || mode === 'reduced') {
        return undefined
      }
      return revealOnEntry(element, [element], {
        entryDistancePx,
        staggerDelayMs: 0,
      })
    },
    [mode, entryDistancePx],
  )
}
