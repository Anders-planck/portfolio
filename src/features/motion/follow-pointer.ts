import { readCursorTarget } from './read-cursor-target'
import { shouldUseSystemCursor } from './should-use-system-cursor'
import type { ViewportPosition } from './viewport-position'

export interface CursorParts {
  ring: HTMLElement
  dot: HTMLElement
  label: HTMLElement
  /**
   * The element whose `data-custom-cursor` hides the system cursor
   * (`<body>`): set only while the ring draws.
   */
  host: HTMLElement
}

export const CUSTOM_CURSOR_ATTRIBUTE = 'data-custom-cursor'

/** The last pointer event, to decide again when a surface opens or closes. */
interface PointerContext {
  target: Element
  pointerType: string
}

/** Below this distance in px the ring is where the pointer is. */
const SETTLED_DISTANCE_PX = 0.4

function toTranslateFromViewportPosition({
  left,
  top,
}: ViewportPosition): string {
  return `translate3d(${String(left)}px, ${String(top)}px, 0)`
}

function hideCursor(parts: CursorParts): void {
  parts.ring.removeAttribute('data-active')
  parts.dot.removeAttribute('data-active')
}

/**
 * Draws the ring or hands over to the system cursor (pen, text entry, an
 * open menu or drawer), and says which it did.
 */
function showCursorFor(parts: CursorParts, context: PointerContext): boolean {
  const isSystemCursor = shouldUseSystemCursor(context)
  parts.host.toggleAttribute(CUSTOM_CURSOR_ATTRIBUTE, !isSystemCursor)
  if (isSystemCursor) {
    hideCursor(parts)
  } else {
    showTarget(parts, context.target)
  }
  return !isSystemCursor
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
 * inertia, in a frame loop that stops once the ring settles. A pen, text
 * entry or an open surface gets the system cursor; opening or closing a
 * surface decides again. Everything is written to the elements; nothing goes
 * through React state (UI-05). Returns the cleanup.
 */
export function followPointer(
  parts: CursorParts,
  ringInertia: number,
): () => void {
  let frame = 0
  let pointer: ViewportPosition | undefined
  let ringPosition: ViewportPosition = { left: 0, top: 0 }
  let lastContext: PointerContext | undefined
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
    if (!(event.target instanceof Element)) {
      return
    }
    lastContext = { target: event.target, pointerType: event.pointerType }
    if (!showCursorFor(parts, lastContext)) {
      return
    }
    const isFirstMove = pointer === undefined
    pointer = { left: event.clientX, top: event.clientY }
    // The ring appears under the pointer, not flying in from a corner.
    ringPosition = isFirstMove ? pointer : ringPosition
    parts.dot.style.transform = toTranslateFromViewportPosition(pointer)
    if (frame === 0) {
      frame = requestAnimationFrame(moveRing)
    }
  }
  // A menu or drawer can open without the pointer moving (click, keyboard).
  const decideAgain = () => {
    requestAnimationFrame(() => {
      if (lastContext !== undefined) {
        showCursorFor(parts, lastContext)
      }
    })
  }
  const hideOnLeave = () => {
    hideCursor(parts)
  }
  const surfaceEvents = ['toggle', 'focusin', 'click', 'keydown'] as const
  window.addEventListener('pointermove', trackPointer, { passive: true })
  document.documentElement.addEventListener('pointerleave', hideOnLeave)
  surfaceEvents.forEach((type) => {
    document.addEventListener(type, decideAgain, true)
  })
  return () => {
    window.removeEventListener('pointermove', trackPointer)
    document.documentElement.removeEventListener('pointerleave', hideOnLeave)
    surfaceEvents.forEach((type) => {
      document.removeEventListener(type, decideAgain, true)
    })
    cancelAnimationFrame(frame)
    parts.host.removeAttribute(CUSTOM_CURSOR_ATTRIBUTE)
  }
}
