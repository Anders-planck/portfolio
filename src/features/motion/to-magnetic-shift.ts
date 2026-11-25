import type { Rect } from './to-untransformed-rect'
import type { ViewportPosition } from './viewport-position'

export interface MagneticOptions {
  radiusPx: number
  strength: number
}

/** How far the control moves, in px. */
interface MagneticShift {
  translateXPx: number
  translateYPx: number
}

/**
 * How far a control moves toward the pointer: a share of the offset from its
 * centre while the pointer is within the radius, nothing outside it.
 */
export function toMagneticShift(
  rect: Rect,
  pointer: ViewportPosition,
  { radiusPx, strength }: MagneticOptions,
): MagneticShift | undefined {
  const offsetX = pointer.left - (rect.left + rect.width / 2)
  const offsetY = pointer.top - (rect.top + rect.height / 2)
  if (Math.hypot(offsetX, offsetY) >= radiusPx) {
    return undefined
  }
  return { translateXPx: offsetX * strength, translateYPx: offsetY * strength }
}
