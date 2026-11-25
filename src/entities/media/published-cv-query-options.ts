import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

/**
 * The CV of the published Profile (header and footer), live: publishing a
 * new CV reaches open pages. Null until one is published.
 */
export function publishedCvQueryOptions() {
  return convexQueryOptions(api.media.getPublishedCv, {})
}
