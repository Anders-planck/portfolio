import { Center } from '@astryxdesign/core/Center'
import { Stack } from '@astryxdesign/core/Stack'
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden'
import { type KeyboardEvent, useId } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import type { BlockFaces } from './block-face'
import type { BlockPose } from './block-pose'
import { BlockShape } from './block-shape'
import { toFaceNumber } from './to-face-number'
import { BLOCK_FACE_COUNT } from './turn-block-to-face'
import { useBlockDrive } from './use-block-drive'

/** Keyboard ‹ ›: the arrow keys bring the previous or next face to the front. */
const TURN_STEP_BY_KEY: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
}

/**
 * The Block. Given `readScrollPose` it moves (immersive layout): scroll
 * turns it, it leans toward the pointer, a drag turns it and snaps it to a
 * face, and the arrow keys turn it a face at a time. Without it, it stands
 * still at its rest pose as a decorative picture (linear layout, ADR 0008).
 */
export function Block({
  faces,
  readScrollPose,
}: {
  faces: BlockFaces
  readScrollPose?: () => BlockPose
}) {
  if (readScrollPose === undefined) {
    return (
      <Center aria-hidden="true" className="perspective-distant">
        <BlockShape faces={faces} />
      </Center>
    )
  }
  return <DrivenBlock faces={faces} readScrollPose={readScrollPose} />
}

/**
 * A slider over the faces: its value is the face at the front, which the
 * arrow keys change. Its children are presentational, so the faces are read
 * through `aria-valuetext` only.
 */
function DrivenBlock({
  faces,
  readScrollPose,
}: {
  faces: BlockFaces
  readScrollPose: () => BlockPose
}) {
  const { immersive } = useMessages()
  const hintId = useId()
  const { handleRef, blockRef, frontFaceIndex, turnByFaces } =
    useBlockDrive(readScrollPose)
  const frontFace = faces[frontFaceIndex] ?? faces[0]

  const turnFromKeyboard = (event: KeyboardEvent) => {
    const step = TURN_STEP_BY_KEY[event.key]
    if (step !== undefined) {
      event.preventDefault()
      turnByFaces(step)
    }
  }

  return (
    <>
      <Stack
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={immersive.blockLabel}
        aria-describedby={hintId}
        aria-valuemin={1}
        aria-valuemax={BLOCK_FACE_COUNT}
        aria-valuenow={frontFaceIndex + 1}
        aria-valuetext={immersive.frontFace(
          toFaceNumber(frontFaceIndex),
          frontFace.label,
        )}
        data-cursor={immersive.blockCursorLabel}
        onKeyDown={turnFromKeyboard}
        align="center"
        padding={4}
        className="cursor-grab touch-pan-y rounded-container perspective-distant select-none focus-visible:outline-2 focus-visible:outline-primary"
      >
        <BlockShape faces={faces} blockRef={blockRef} />
      </Stack>
      <VisuallyHidden id={hintId}>{immersive.blockKeyboardHint}</VisuallyHidden>
    </>
  )
}
