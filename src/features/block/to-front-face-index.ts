import { BLOCK_FACE_COUNT, FACE_ANGLE_DEG } from './block-face'

/**
 * Which face (0-based) looks at the reader when the Block is turned by
 * `yawDeg`. Face n sits at n quarter turns, so a turn of -90° shows face 1.
 */
export function toFrontFaceIndex(yawDeg: number): number {
  const turns = Math.round(-yawDeg / FACE_ANGLE_DEG)
  return ((turns % BLOCK_FACE_COUNT) + BLOCK_FACE_COUNT) % BLOCK_FACE_COUNT
}
