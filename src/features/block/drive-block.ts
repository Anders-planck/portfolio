import type { BlockPose } from './block-pose'
import {
  type BlockMotionState,
  toBlockTransform,
  type ViewportPointer,
} from './to-block-transform'
import { toFrontFaceIndex, toTurnYawDegAtFace } from './to-turn-yaw-deg-at-face'
import { trackBlockDrag } from './track-block-drag'

/** The two elements of a driven Block. */
export interface BlockElements {
  /** Takes the drag: the area around the Block. */
  handle: HTMLElement
  /** Turns: the element the faces sit on. */
  block: HTMLElement
}

export interface BlockDriveOptions {
  /** The pose the scroll gives the Block now; read once per frame. */
  readScrollPose: () => BlockPose
  /** Called when another face comes to the front, never per frame otherwise. */
  onFrontFaceChange: (frontFaceIndex: number) => void
}

export interface BlockDrive {
  /** Brings the face `step` faces away to the front (keyboard ‹ ›). */
  turnByFaces: (step: number) => void
  stop: () => void
}

function toViewportPointer(event: PointerEvent): ViewportPointer {
  return {
    horizontal: (event.clientX / window.innerWidth) * 2 - 1,
    vertical: (event.clientY / window.innerHeight) * 2 - 1,
  }
}

/**
 * Drives a Block: scroll turns it, a mouse makes it lean, a drag turns it
 * and snaps it to a face on release. Each frame writes the transform
 * straight to the element; nothing goes through React state, and
 * `onFrontFaceChange` fires only when the front face changes. Returns the
 * keyboard turn and the cleanup.
 */
export function driveBlock(
  { handle, block }: BlockElements,
  { readScrollPose, onFrontFaceChange }: BlockDriveOptions,
): BlockDrive {
  let pendingFrameId = 0
  let frontFaceIndex: number | undefined
  const motion: Omit<BlockMotionState, 'scrollPose'> = {
    turnYawDeg: 0,
    dragPitchDeg: 0,
    pointer: undefined,
    hasBeenTurned: false,
  }

  const draw = () => {
    pendingFrameId = 0
    const scrollPose = readScrollPose()
    block.style.transform = toBlockTransform({ ...motion, scrollPose })
    const front = toFrontFaceIndex(scrollPose.yawDeg + motion.turnYawDeg)
    if (front !== frontFaceIndex) {
      frontFaceIndex = front
      onFrontFaceChange(front)
    }
  }
  const scheduleDraw = () => {
    if (pendingFrameId === 0) {
      pendingFrameId = requestAnimationFrame(draw)
    }
  }
  const turnToFace = (step: number) => {
    motion.turnYawDeg = toTurnYawDegAtFace(
      { scrollYawDeg: readScrollPose().yawDeg, turnYawDeg: motion.turnYawDeg },
      step,
    )
    motion.dragPitchDeg = 0
    motion.hasBeenTurned = true
    scheduleDraw()
  }
  const leanToPointer = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      motion.pointer = toViewportPointer(event)
      scheduleDraw()
    }
  }
  const stopDragTracking = trackBlockDrag(
    { handle, block },
    {
      readTurnYawDeg: () => motion.turnYawDeg,
      onDragMove: ({ turnYawDeg, dragPitchDeg }) => {
        motion.turnYawDeg = turnYawDeg
        motion.dragPitchDeg = dragPitchDeg
        scheduleDraw()
      },
      onDragEnd: () => {
        turnToFace(0)
      },
    },
  )

  window.addEventListener('scroll', scheduleDraw, { passive: true })
  window.addEventListener('resize', scheduleDraw, { passive: true })
  window.addEventListener('pointermove', leanToPointer, { passive: true })
  scheduleDraw()

  return {
    turnByFaces: turnToFace,
    stop: () => {
      stopDragTracking()
      window.removeEventListener('scroll', scheduleDraw)
      window.removeEventListener('resize', scheduleDraw)
      window.removeEventListener('pointermove', leanToPointer)
      cancelAnimationFrame(pendingFrameId)
      block.style.removeProperty('transform')
    },
  }
}
