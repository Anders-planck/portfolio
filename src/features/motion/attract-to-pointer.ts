import { type MagneticOptions, toMagneticShift } from './to-magnetic-shift'
import { type Rect, toUntransformedRect } from './to-untransformed-rect'
import type { ViewportPosition } from './viewport-position'

/**
 * Magnetic: pulls `element` toward a mouse pointer near it. Measures its
 * untransformed box with `getBoundingClientRect` once, and again only after
 * a scroll or resize moved it, and writes the transform straight to the
 * element; nothing goes through React state. The control eases with its own
 * token-backed transition classes. Returns the cleanup.
 */
export function attractToPointer(
  element: HTMLElement,
  options: MagneticOptions,
): () => void {
  let frame = 0
  let pointer: ViewportPosition | undefined
  let restingRect: Rect | undefined
  const measureRestingRect = (): Rect =>
    toUntransformedRect(
      element.getBoundingClientRect(),
      getComputedStyle(element).transform,
    )
  const forgetRestingRect = () => {
    restingRect = undefined
  }
  const moveElement = () => {
    frame = 0
    if (pointer === undefined) {
      return
    }
    restingRect ??= measureRestingRect()
    const shift = toMagneticShift(restingRect, pointer, options)
    element.style.transform =
      shift === undefined
        ? ''
        : `translate(${String(shift.translateXPx)}px, ${String(shift.translateYPx)}px)`
  }
  const trackPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      return
    }
    pointer = { left: event.clientX, top: event.clientY }
    if (frame === 0) {
      frame = requestAnimationFrame(moveElement)
    }
  }
  window.addEventListener('pointermove', trackPointer, { passive: true })
  window.addEventListener('resize', forgetRestingRect, { passive: true })
  // Capture: a scroll of any container can move the control.
  window.addEventListener('scroll', forgetRestingRect, {
    passive: true,
    capture: true,
  })
  return () => {
    window.removeEventListener('pointermove', trackPointer)
    window.removeEventListener('resize', forgetRestingRect)
    window.removeEventListener('scroll', forgetRestingRect, { capture: true })
    cancelAnimationFrame(frame)
    element.style.removeProperty('transform')
  }
}
