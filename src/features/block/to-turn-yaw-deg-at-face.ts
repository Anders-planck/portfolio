import { FACE_ANGLE_DEG } from './block-face'

/** The Block's turn: the part scroll gives it and the part the reader adds. */
export interface BlockTurn {
  scrollYawDeg: number
  turnYawDeg: number
}

/**
 * The reader's turn that leaves a face square to the reader: the face
 * nearest the Block's current yaw, moved by `step` faces (+1 brings the
 * next face to the front, -1 the previous one, 0 just snaps). Returned as
 * the reader's part, so scroll keeps adding its own.
 */
export function toTurnYawDegAtFace(
  { scrollYawDeg, turnYawDeg }: BlockTurn,
  step: number,
): number {
  const nearestFaceYawDeg =
    Math.round((scrollYawDeg + turnYawDeg) / FACE_ANGLE_DEG) * FACE_ANGLE_DEG
  return nearestFaceYawDeg - step * FACE_ANGLE_DEG - scrollYawDeg
}
