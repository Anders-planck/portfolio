/** Degrees of turn per pixel of drag, across and up/down (mockup Home). */
const DRAG_YAW_DEG_PER_PX = 0.45
const DRAG_PITCH_DEG_PER_PX = 0.25
const MAX_DRAG_PITCH_DEG = 20

export interface BlockDragCallbacks {
  /** The reader's turn when the drag starts. */
  readTurnYawDeg: () => number
  /** While dragging: the turn and the tip the pointer gives the Block. */
  onDragMove: (drag: { turnYawDeg: number; dragPitchDeg: number }) => void
  /** On release (or a cancelled pointer): time to snap to a face. */
  onDragEnd: () => void
}

interface DragStart {
  pointerId: number
  clientX: number
  clientY: number
  turnYawDeg: number
}

/**
 * The drag gesture on a Block: a mouse or pen pressed on `handle` turns
 * the Block across and tips it up/down (within a limit) until released.
 * Touch keeps scrolling the page. `block` carries `data-dragging` meanwhile,
 * so its transition stops and it follows the pointer exactly. Returns the
 * cleanup.
 */
export function trackBlockDrag(
  { handle, block }: { handle: HTMLElement; block: HTMLElement },
  { readTurnYawDeg, onDragMove, onDragEnd }: BlockDragCallbacks,
): () => void {
  let dragStart: DragStart | undefined

  const startDrag = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || event.button !== 0) {
      return
    }
    handle.setPointerCapture(event.pointerId)
    dragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      turnYawDeg: readTurnYawDeg(),
    }
    block.dataset.dragging = ''
  }
  const moveDrag = (event: PointerEvent) => {
    if (dragStart?.pointerId !== event.pointerId) {
      return
    }
    const pitchDeg = (dragStart.clientY - event.clientY) * DRAG_PITCH_DEG_PER_PX
    onDragMove({
      turnYawDeg:
        dragStart.turnYawDeg +
        (event.clientX - dragStart.clientX) * DRAG_YAW_DEG_PER_PX,
      dragPitchDeg: Math.max(
        -MAX_DRAG_PITCH_DEG,
        Math.min(MAX_DRAG_PITCH_DEG, pitchDeg),
      ),
    })
  }
  const endDrag = (event: PointerEvent) => {
    if (dragStart?.pointerId !== event.pointerId) {
      return
    }
    dragStart = undefined
    delete block.dataset.dragging
    onDragEnd()
  }

  handle.addEventListener('pointerdown', startDrag)
  handle.addEventListener('pointermove', moveDrag)
  handle.addEventListener('pointerup', endDrag)
  handle.addEventListener('pointercancel', endDrag)
  return () => {
    handle.removeEventListener('pointerdown', startDrag)
    handle.removeEventListener('pointermove', moveDrag)
    handle.removeEventListener('pointerup', endDrag)
    handle.removeEventListener('pointercancel', endDrag)
    delete block.dataset.dragging
  }
}
