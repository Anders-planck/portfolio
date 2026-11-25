/** The Block has four faces (GLOSSARY), a quarter turn apart. */
export const BLOCK_FACE_COUNT = 4
const FACE_ANGLE_DEG = 360 / BLOCK_FACE_COUNT

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
export function turnBlockToFace(
  { scrollYawDeg, turnYawDeg }: BlockTurn,
  step: number,
): number {
  const nearestFaceYawDeg =
    Math.round((scrollYawDeg + turnYawDeg) / FACE_ANGLE_DEG) * FACE_ANGLE_DEG
  return nearestFaceYawDeg - step * FACE_ANGLE_DEG - scrollYawDeg
}

/**
 * Which face (0-based) looks at the reader when the Block is turned by
 * `yawDeg`. Face n sits at n quarter turns, so a turn of -90° shows face 1.
 */
export function toFrontFaceIndex(yawDeg: number): number {
  const turns = Math.round(-yawDeg / FACE_ANGLE_DEG)
  return ((turns % BLOCK_FACE_COUNT) + BLOCK_FACE_COUNT) % BLOCK_FACE_COUNT
}
