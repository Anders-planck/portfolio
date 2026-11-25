import { type MagneticOptions, toMagneticOffset } from './to-magnetic-offset'
import type { ViewportPosition } from './viewport-position'

/**
 * Magnetic: pulls `element` toward a mouse pointer near it. Measures with
 * `getBoundingClientRect` once per frame at most and writes the transform
 * straight to the element; nothing goes through React state. The control
 * eases with its own token-backed transition classes. Returns the cleanup.
 */
export function attractToPointer(
  element: HTMLElement,
  options: MagneticOptions,
): () => void {
  let frame = 0
  let pointer: ViewportPosition | undefined
  const moveElement = () => {
    frame = 0
    if (pointer === undefined) {
      return
    }
    const offset = toMagneticOffset(
      element.getBoundingClientRect(),
      pointer,
      options,
    )
    element.style.transform =
      offset === undefined
        ? ''
        : `translate(${String(offset.translateXPx)}px, ${String(offset.translateYPx)}px)`
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
  return () => {
    window.removeEventListener('pointermove', trackPointer)
    cancelAnimationFrame(frame)
    element.style.removeProperty('transform')
  }
}
