import { BLOCK_FACE_COUNT } from './block-face'

/** The parts of a key press the Block reads. */
export interface BlockKeyPress {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

/**
 * How many faces a key turns the Block by, given the face at the front:
 * ← → one face, Home/End to the first/last face. Up and Down are left to
 * the page, so they keep scrolling it (resolution 2), and so is any key
 * with a modifier (browser and system shortcuts). Undefined: not ours.
 */
export function toTurnStepFromKey(
  { key, altKey, ctrlKey, metaKey, shiftKey }: BlockKeyPress,
  frontFaceIndex: number,
): number | undefined {
  if (altKey || ctrlKey || metaKey || shiftKey) {
    return undefined
  }
  switch (key) {
    case 'ArrowLeft':
      return -1
    case 'ArrowRight':
      return 1
    case 'Home':
      return -frontFaceIndex
    case 'End':
      return BLOCK_FACE_COUNT - 1 - frontFaceIndex
    default:
      return undefined
  }
}
