import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

export type MediaLibrary = FunctionReturnType<typeof api.media.listMedia>
export type MediaEntry = MediaLibrary['media'][number]
export type MediaUsage = MediaEntry['usages'][number]
export type AltSaveOutcome = FunctionReturnType<typeof api.media.saveAlt>

/** CMS Media: every upload with its alt per locale and usage (owner only). */
export function mediaLibraryQueryOptions() {
  return convexQueryOptions(api.media.listMedia, {})
}
