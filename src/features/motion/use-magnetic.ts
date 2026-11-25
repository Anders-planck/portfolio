import { type RefCallback, useCallback } from 'react'

import { attractToPointer } from './attract-to-pointer'
import { canFollowPointer, useMotion } from './use-motion'

/**
 * Magnetic: the control this ref is on leans toward a mouse pointer near
 * it. Off on touch and with reduced motion (ADR 0008).
 */
export function useMagnetic<Target extends HTMLElement>(): RefCallback<Target> {
  const motion = useMotion()
  const isMagnetic = canFollowPointer(motion)
  const { magneticRadiusPx, magneticStrength } = motion.knobs
  return useCallback(
    (element: Target | null) => {
      if (element === null || !isMagnetic) {
        return undefined
      }
      return attractToPointer(element, {
        radiusPx: magneticRadiusPx,
        strength: magneticStrength,
      })
    },
    [isMagnetic, magneticRadiusPx, magneticStrength],
  )
}
