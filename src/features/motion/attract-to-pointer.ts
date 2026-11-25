export interface MagneticOptions {
  radiusPx: number
  strength: number
}

/** A viewport position, as pointer events give it. */
interface PointerPosition {
  left: number
  top: number
}

/** How far the control moves, in px. */
interface MagneticShift {
  translateX: number
  translateY: number
}

/**
 * How far a control moves toward the pointer: a share of the offset from its
 * centre while the pointer is within the radius, nothing outside it.
 */
export function toMagneticOffset(
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  pointer: PointerPosition,
  { radiusPx, strength }: MagneticOptions,
): MagneticShift | undefined {
  const offsetX = pointer.left - (rect.left + rect.width / 2)
  const offsetY = pointer.top - (rect.top + rect.height / 2)
  if (Math.hypot(offsetX, offsetY) >= radiusPx) {
    return undefined
  }
  return { translateX: offsetX * strength, translateY: offsetY * strength }
}

/**
 * Magnetic: pulls `element` toward a mouse pointer near it. Measures with
 * `getBoundingClientRect` once per frame at most and writes the transform
 * straight to the element; nothing goes through React state. The theme's
 * move curve eases it back. Returns the cleanup.
 */
export function attractToPointer(
  element: HTMLElement,
  options: MagneticOptions,
): () => void {
  let frame = 0
  let pointer: PointerPosition | undefined
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
        : `translate(${String(offset.translateX)}px, ${String(offset.translateY)}px)`
  }
  const followPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      return
    }
    pointer = { left: event.clientX, top: event.clientY }
    if (frame === 0) {
      frame = requestAnimationFrame(moveElement)
    }
  }
  element.style.transition = 'transform var(--duration-medium) var(--ease-move)'
  window.addEventListener('pointermove', followPointer, { passive: true })
  return () => {
    window.removeEventListener('pointermove', followPointer)
    cancelAnimationFrame(frame)
    element.style.removeProperty('transform')
    element.style.removeProperty('transition')
  }
}
