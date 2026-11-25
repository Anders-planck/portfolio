/**
 * How a chapter holds the Block: its turn around the vertical axis and its
 * size. The scene config (ticket 16) publishes one per chapter.
 */
export interface BlockPose {
  yawDeg: number
  scale: number
}

/** Facing the reader at full size. */
export const FRONT_BLOCK_POSE: BlockPose = { yawDeg: 0, scale: 1 }
