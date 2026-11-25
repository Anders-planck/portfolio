import { use } from 'react'

import { type Motion, MotionContext } from './motion-provider'

export function useMotion(): Motion {
  return use(MotionContext)
}

/**
 * Whether effects that follow the pointer (custom cursor, magnetic, tilt)
 * may run: only with a fine pointer and without reduced motion (ADR 0008,
 * resolution 8). Otherwise the system cursor and still controls stay.
 */
export function canFollowPointer({ mode, pointer }: Motion): boolean {
  return mode === 'animated' && pointer === 'fine'
}
