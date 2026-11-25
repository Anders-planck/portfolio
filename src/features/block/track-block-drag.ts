/** Degrees of turn per pixel of drag, across and up/down (mockup Home). */
const DRAG_YAW_DEG_PER_PX = 0.45
const DRAG_PITCH_DEG_PER_PX = 0.25
const MAX_DRAG_PITCH_DEG = 20
/** How far a pressed pointer moves before a press becomes a drag. */
const DRAG_THRESHOLD_PX = 4

export interface BlockDragCallbacks {
  /** The reader's turn when the drag starts. */
  readTurnYawDeg: () => number
  /** While dragging: the turn and the tip the pointer gives the Block. */
  onDragMove: (drag: { turnYawDeg: number; dragPitchDeg: number }) => void
  /** On release, a cancelled pointer or a lost capture: snap to a face. */
  onDragEnd: () => void
}

interface Press {
  pointerId: number
  clientX: number
  clientY: number
  turnYawDeg: number
  isDragging: boolean
}

function toBlockDragFromPress(press: Press, event: PointerEvent) {
  const pitchDeg = (press.clientY - event.clientY) * DRAG_PITCH_DEG_PER_PX
  return {
    turnYawDeg:
      press.turnYawDeg + (event.clientX - press.clientX) * DRAG_YAW_DEG_PER_PX,
    dragPitchDeg: Math.max(
      -MAX_DRAG_PITCH_DEG,
      Math.min(MAX_DRAG_PITCH_DEG, pitchDeg),
    ),
  }
}

/**
 * The drag gesture on a Block: a mouse or pen pressed on `handle` and moved
 * past a few pixels turns the Block across and tips it up/down (within a
 * limit) until released; a click that does not move is no drag. Touch
 * keeps scrolling the page, while a pen gets `touch-action: none` on the
 * handle so its drag is not taken for a scroll. `block` carries
 * `data-dragging` meanwhile, so its transition stops and it follows the
 * pointer exactly. Returns the cleanup.
 */
export function trackBlockDrag(
  { handle, block }: { handle: HTMLElement; block: HTMLElement },
  { readTurnYawDeg, onDragMove, onDragEnd }: BlockDragCallbacks,
): () => void {
  let press: Press | undefined

  const fitTouchActionToPointer = (event: PointerEvent) => {
    handle.style.touchAction = event.pointerType === 'pen' ? 'none' : ''
  }
  const startPress = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0) {
      return
    }
    handle.setPointerCapture(event.pointerId)
    press = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      turnYawDeg: readTurnYawDeg(),
      isDragging: false,
    }
  }
  const moveDrag = (event: PointerEvent) => {
    if (press?.pointerId !== event.pointerId) {
      return
    }
    const distancePx = Math.hypot(
      event.clientX - press.clientX,
      event.clientY - press.clientY,
    )
    if (!press.isDragging && distancePx < DRAG_THRESHOLD_PX) {
      return
    }
    press.isDragging = true
    block.dataset.dragging = ''
    onDragMove(toBlockDragFromPress(press, event))
  }
  const endPress = (event: PointerEvent) => {
    if (press?.pointerId !== event.pointerId) {
      return
    }
    const wasDragging = press.isDragging
    press = undefined
    delete block.dataset.dragging
    if (wasDragging) {
      onDragEnd()
    }
  }

  const listeners = [
    ['pointerover', fitTouchActionToPointer],
    ['pointerdown', startPress],
    ['pointermove', moveDrag],
    ['pointerup', endPress],
    ['pointercancel', endPress],
    ['lostpointercapture', endPress],
  ] as const
  listeners.forEach(([type, listener]) => {
    handle.addEventListener(type, listener)
  })
  return () => {
    listeners.forEach(([type, listener]) => {
      handle.removeEventListener(type, listener)
    })
    handle.style.removeProperty('touch-action')
    delete block.dataset.dragging
  }
}
