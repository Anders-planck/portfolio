import { useCallback, useEffect, useRef, useState } from 'react'

import type { BlockPose } from './block-pose'
import { type BlockDrive, driveBlock } from './drive-block'

/**
 * Connects a Block's handle and turning element to `driveBlock` while they
 * are mounted. `readScrollPose` must keep its identity (a `useCallback`):
 * a new one restarts the drive. React state changes only when another face
 * comes to the front.
 */
export function useBlockDrive(readScrollPose: () => BlockPose) {
  const handleRef = useRef<HTMLElement>(null)
  const blockRef = useRef<HTMLElement>(null)
  const driveRef = useRef<BlockDrive>(undefined)
  const [frontFaceIndex, setFrontFaceIndex] = useState(0)

  useEffect(() => {
    const handle = handleRef.current
    const block = blockRef.current
    if (handle === null || block === null) {
      return undefined
    }
    const drive = driveBlock(
      { handle, block },
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

  return { handleRef, blockRef, frontFaceIndex, turnByFaces }
}
