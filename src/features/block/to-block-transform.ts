import type { BlockPose } from './block-pose'

/** The pointer across the viewport: -1 at the left/top edge, 1 at the right/bottom. */
export interface ViewportPointer {
  horizontal: number
  vertical: number
}

/** What moves the Block in one frame, besides its rest tilt. */
export interface BlockMotionState {
  scrollPose: BlockPose
  /** The reader's turn (drag, keyboard), snapped to a face once released. */
  turnYawDeg: number
  /** The tip of a drag in progress; 0 once released. */
  dragPitchDeg: number
  /** Undefined until a mouse moves over the page. */
  pointer: ViewportPointer | undefined
  /** After the first drag or key turn the Block follows the pointer less. */
  hasBeenTurned: boolean
}

/** The Block leans back a little, so the top cap shows (mockup Home). */
const REST_PITCH_DEG = -14
/** How far the Block leans toward a pointer at the edge of the viewport. */
const POINTER_LEAN = {
  untouched: { yawDeg: 30, pitchDeg: 10 },
  turned: { yawDeg: 6, pitchDeg: 4 },
}

/**
 * The CSS transform of the Block in one frame: the rest tilt, the scroll
 * pose, the reader's turn and drag, and the lean toward the pointer.
 */
export function toBlockTransform({
  scrollPose,
  turnYawDeg,
  dragPitchDeg,
  pointer,
  hasBeenTurned,
}: BlockMotionState): string {
  const lean = hasBeenTurned ? POINTER_LEAN.turned : POINTER_LEAN.untouched
  const leanYawDeg = (pointer?.horizontal ?? 0) * lean.yawDeg
  const leanPitchDeg = (pointer?.vertical ?? 0) * lean.pitchDeg
  const pitchDeg = REST_PITCH_DEG + dragPitchDeg - leanPitchDeg
  const yawDeg = scrollPose.yawDeg + turnYawDeg + leanYawDeg
  return `rotateX(${String(pitchDeg)}deg) rotateY(${String(yawDeg)}deg) scale(${String(scrollPose.scale)})`
}
