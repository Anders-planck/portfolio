import { useMediaQuery } from '@astryxdesign/core/hooks'

import { IMMERSIVE_MEDIA_QUERY } from './immersive-media-query'

/**
 * Whether the Stage's behaviour (the driven Block) runs. CSS lays the
 * immersive layout out on its own (the `immersive:` variant); this only
 * tells JS. On the server and in the first client render it is false, so
 * the Block stands still until the reader's settings are known.
 */
export function useImmersiveLayout(): boolean {
  return useMediaQuery(IMMERSIVE_MEDIA_QUERY, false)
}
