import { Stack } from '@astryxdesign/core/Stack'
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden'
import { type KeyboardEvent, useId } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import { BLOCK_FACE_COUNT, type BlockFaces } from './block-face'
import type { BlockPose } from './block-pose'
import { BlockShape } from './block-shape'
import { toFaceNumber } from './to-face-number'
import { useBlockDrive } from './use-block-drive'

/**
 * How many faces a key turns the Block by, given the face at the front:
 * ← → one face, Home/End to the first/last face. Up and Down are left to
 * the page, so they keep scrolling it (resolution 2), and so is any key
 * with a modifier (browser and system shortcuts).
 */
function toTurnStepFromKey(
  event: KeyboardEvent,
  frontFaceIndex: number,
): number | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return undefined
  }
  switch (event.key) {
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

/**
 * The Block. Given `readScrollPose` it moves (immersive layout): scroll
 * turns it, it leans toward the pointer, a drag turns it and snaps it to a
 * face, and the keys turn it a face at a time; it is then a slider whose
 * value is the face at the front (its children are presentational, read
 * through `aria-valuetext`). Without it, it stands still at its rest pose
 * as a decorative picture (linear layout, ADR 0008). Both render the same
 * box, so the switch moves nothing.
 */
export function Block({
  faces,
  readScrollPose,
}: {
  faces: BlockFaces
  readScrollPose?: (() => BlockPose) | undefined
}) {
  const { immersive } = useMessages()
  const hintId = useId()
  const { handleRef, blockRef, frontFaceIndex, turnByFaces } =
    useBlockDrive(readScrollPose)
  const frontFace = faces[frontFaceIndex] ?? faces[0]
  const isDriven = readScrollPose !== undefined

  const turnFromKeyboard = (event: KeyboardEvent) => {
    const step = toTurnStepFromKey(event, frontFaceIndex)
    if (step !== undefined) {
      event.preventDefault()
      turnByFaces(step)
    }
  }
  const sliderProps = {
    role: 'slider',
    tabIndex: 0,
    'aria-label': immersive.blockLabel,
    'aria-describedby': hintId,
    'aria-valuemin': 1,
    'aria-valuemax': BLOCK_FACE_COUNT,
    'aria-valuenow': frontFaceIndex + 1,
    'aria-valuetext': immersive.frontFace(
      toFaceNumber(frontFaceIndex),
      frontFace.label,
    ),
    'data-cursor': immersive.blockCursorLabel,
    onKeyDown: turnFromKeyboard,
  }

  return (
    <>
      <Stack
        ref={handleRef}
        {...(isDriven ? sliderProps : { 'aria-hidden': true })}
        align="center"
        padding={4}
        className="touch-pan-y rounded-container perspective-distant select-none focus-visible:outline-2 focus-visible:outline-primary data-cursor:cursor-grab"
      >
        <BlockShape faces={faces} blockRef={blockRef} />
      </Stack>
      {isDriven && (
        <VisuallyHidden id={hintId}>
          {immersive.blockKeyboardHint}
        </VisuallyHidden>
      )}
    </>
  )
}
