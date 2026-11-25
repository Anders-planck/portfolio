import { readCursorTarget } from './read-cursor-target'
import type { ViewportPosition } from './viewport-position'

export interface CursorParts {
  ring: HTMLElement
  dot: HTMLElement
  label: HTMLElement
}

/** Below this distance in px the ring is where the pointer is. */
const SETTLED_DISTANCE_PX = 0.4

function toTranslateFromViewportPosition({
  left,
  top,
}: ViewportPosition): string {
  return `translate3d(${String(left)}px, ${String(top)}px, 0)`
}

function showTarget(parts: CursorParts, element: Element | null): void {
  const target = readCursorTarget(element)
  const isLink = target.kind === 'link'
  const isLabel = target.kind === 'label'
  ;[parts.ring, parts.dot].forEach((part) => {
    part.toggleAttribute('data-active', true)
    part.toggleAttribute('data-link', isLink)
    part.toggleAttribute('data-label', isLabel)
  })
  parts.label.textContent = isLabel ? target.label : ''
}

/**
 * Moves the cursor dot with a mouse pointer and lets the ring catch up with
 * inertia, in a frame loop that stops once the ring settles. Everything is
 * written to the elements; nothing goes through React state (UI-05).
 * Returns the cleanup.
 */
export function followPointer(
  parts: CursorParts,
  ringInertia: number,
): () => void {
  let frame = 0
  let pointer: ViewportPosition | undefined
  let ringPosition: ViewportPosition = { left: 0, top: 0 }
  const moveRing = () => {
    if (pointer === undefined) {
      frame = 0
      return
    }
    ringPosition = {
      left:
        ringPosition.left + (pointer.left - ringPosition.left) * ringInertia,
      top: ringPosition.top + (pointer.top - ringPosition.top) * ringInertia,
    }
    const distance = Math.hypot(
      pointer.left - ringPosition.left,
      pointer.top - ringPosition.top,
    )
    const isSettled = distance < SETTLED_DISTANCE_PX
    parts.ring.style.transform = toTranslateFromViewportPosition(
      isSettled ? pointer : ringPosition,
    )
    frame = isSettled ? 0 : requestAnimationFrame(moveRing)
  }
  const trackPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') {
      return
    }
    const isFirstMove = pointer === undefined
    pointer = { left: event.clientX, top: event.clientY }
    // The ring appears under the pointer, not flying in from a corner.
    ringPosition = isFirstMove ? pointer : ringPosition
    parts.dot.style.transform = toTranslateFromViewportPosition(pointer)
    showTarget(parts, event.target instanceof Element ? event.target : null)
    if (frame === 0) {
      frame = requestAnimationFrame(moveRing)
    }
  }
  const hideCursor = () => {
    parts.ring.removeAttribute('data-active')
    parts.dot.removeAttribute('data-active')
  }
  window.addEventListener('pointermove', trackPointer, { passive: true })
  document.documentElement.addEventListener('pointerleave', hideCursor)
  return () => {
    window.removeEventListener('pointermove', trackPointer)
    document.documentElement.removeEventListener('pointerleave', hideCursor)
    cancelAnimationFrame(frame)
  }
}
