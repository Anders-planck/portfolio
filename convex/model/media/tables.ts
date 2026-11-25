import { defineTable } from 'convex/server'
import { type Infer, v } from 'convex/values'

import { localeValidator } from '../content/locales'
import { mediaMimeValidator } from './files'

/**
 * The media tables (README), spread into `convex/schema.ts`. Media and alt
 * text are live data like metrics: a new upload or alt shows at once
 * wherever a published document already points at the media.
 */

/** The most media one read lists; a portfolio has tens. */
export const MAX_MEDIA = 500

/** Who wrote an alt: the owner (reviewed) or the AI assistant (ticket 14). */
export const altReviewStateValidator = v.union(
  v.literal('reviewed'),
  v.literal('to-review'),
)
export type AltReviewState = Infer<typeof altReviewStateValidator>

export const MEDIA_TABLES = {
  media: defineTable({
    /** The object in the R2 bucket; also the path under the public origin. */
    objectKey: v.string(),
    /** The name the owner uploaded, shown in the CMS. */
    fileName: v.string(),
    mime: mediaMimeValidator,
    bytes: v.number(),
    widthPx: v.union(v.number(), v.null()),
    heightPx: v.union(v.number(), v.null()),
    /** The upload that created it: a repeated completion finds it here. */
    uploadRequestId: v.string(),
    uploadedAt: v.number(),
  }).index('by_upload_request_id', ['uploadRequestId']),

  /** Alt text of an image, one record per locale. */
  mediaAlt: defineTable({
    mediaId: v.id('media'),
    locale: localeValidator,
    alt: v.string(),
    reviewState: altReviewStateValidator,
    updatedAt: v.number(),
  }).index('by_media_and_locale', ['mediaId', 'locale']),
}
