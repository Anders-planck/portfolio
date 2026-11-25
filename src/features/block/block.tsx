import { Stack } from '@astryxdesign/core/Stack'
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden'
import { type KeyboardEvent, useId } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import { BLOCK_FACE_COUNT, type BlockFaces } from './block-face'
import type { BlockPose } from './block-pose'
import { BlockShape } from './block-shape'
import { toFaceNumber } from './to-face-number'
import { toTurnStepFromKey } from './to-turn-step-from-key'
import { useBlockDrive } from './use-block-drive'

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
