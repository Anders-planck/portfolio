import { v } from 'convex/values'

import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import type { Locale } from '../content/locales'
import { readImageTransformOrigin, readMediaStorageSettings } from '../env'
import { readAltRecords } from './alts'
import { toMediaKindFromMime } from './files'
import { toPublicObjectUrl } from './storage'
import { type ImageSources, toImageSources } from './variants'

/**
 * Images shown by note figures (`::figure{media="…"}`): sources with their
 * AVIF/WebP variants, pixel size and the alt text of each locale.
 */

/** A figure's image as the site renders it in one locale. */
export const figureImageValidator = v.object({
  src: v.string(),
  srcSet: v.union(v.string(), v.null()),
  widthPx: v.number(),
  heightPx: v.number(),
  alt: v.string(),
})

export interface FigureMedia {
  sources: ImageSources
  widthPx: number
  heightPx: number
  /** Alt text by locale; a locale without one shows no figure. */
  alts: ReadonlyMap<Locale, string>
}

/**
 * The images the given ids name, by the id as written. Ids that are not
 * images (or name nothing), and every id while storage is not configured,
 * are left out: those figures are not shown.
 */
export async function readFigureMedia(
  ctx: QueryCtx,
  writtenIds: readonly string[],
): Promise<ReadonlyMap<string, FigureMedia>> {
  const settings = readMediaStorageSettings()
  if (settings === null || writtenIds.length === 0) {
    return new Map()
  }
  const transformOrigin = readImageTransformOrigin()
  const entries = await Promise.all(
    [...new Set(writtenIds)].map(async (writtenId) => {
      const mediaId = ctx.db.normalizeId('media', writtenId)
      const media = mediaId === null ? null : await ctx.db.get(mediaId)
      if (media === null || !isSizedImage(media)) {
        return null
      }
      const originalUrl = toPublicObjectUrl(
        settings.publicOrigin,
        media.objectKey,
      )
      const alts = await readAltRecords(ctx, media._id)
      const figure: FigureMedia = {
        sources: toImageSources(
          { originalUrl, widthPx: media.widthPx },
          transformOrigin,
        ),
        widthPx: media.widthPx,
        heightPx: media.heightPx,
        alts: new Map(alts.map((record) => [record.locale, record.alt])),
      }
      return [writtenId, figure] as const
    }),
  )
  return new Map(entries.filter((entry) => entry !== null))
}

/** An image with its pixel size (every image has one; files have none). */
function isSizedImage(
  media: Doc<'media'>,
): media is Doc<'media'> & { widthPx: number; heightPx: number } {
  return (
    toMediaKindFromMime(media.mime) === 'image' &&
    media.widthPx !== null &&
    media.heightPx !== null
  )
}
