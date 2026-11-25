import { useMediaQuery } from '@astryxdesign/core/hooks'

import {
  canFollowPointer,
  useMotionSettings,
} from '../../features/motion/use-motion-settings'

/** The width the header switches to its menu drawer at, too (`lg`). */
const WIDE_SCREEN_QUERY = '(min-width: 1024px)'

/**
 * Whether an immersive page pins its scene and moves the Block: on a wide
 * screen, with a fine pointer and without reduced motion (ADR 0008,
 * resolution 7). Otherwise it renders as a linear page. On the server and
 * in the first client render it is linear, like every motion setting.
 */
export function useImmersiveLayout(): boolean {
  const isWideScreen = useMediaQuery(WIDE_SCREEN_QUERY, false)
  return isWideScreen && canFollowPointer(useMotionSettings())
}
