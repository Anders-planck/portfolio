import { useCallback, useEffect, useRef, useState } from 'react'

import type { BlockPose } from './block-pose'
import { type BlockDrive, driveBlock } from './drive-block'

/**
 * Connects a Block's dragArea and turning element to `driveBlock` while
 * `readScrollPose` is given; without it the Block stands still.
 * `readScrollPose` must keep its identity (a `useCallback`): a new one
 * restarts the drive. React state changes only when another face comes to
 * the front.
 */
export function useBlockDrive(readScrollPose: (() => BlockPose) | undefined) {
  const dragAreaRef = useRef<HTMLElement>(null)
  const blockRef = useRef<HTMLElement>(null)
  const driveRef = useRef<BlockDrive>(undefined)
  const [frontFaceIndex, setFrontFaceIndex] = useState(0)

  useEffect(() => {
    const dragArea = dragAreaRef.current
    const block = blockRef.current
    if (dragArea === null || block === null || readScrollPose === undefined) {
      return undefined
    }
    const drive = driveBlock(
      { dragArea, block },
      { readScrollPose, onFrontFaceChange: setFrontFaceIndex },
    )
    driveRef.current = drive
    return () => {
      drive.stop()
      driveRef.current = undefined
    }
  }, [readScrollPose])

  const turnByFaces = useCallback((step: number) => {
    driveRef.current?.turnByFaces(step)
  }, [])

  return { dragAreaRef, blockRef, frontFaceIndex, turnByFaces }
}
