import type { Doc } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import type { Locale } from '../content/locales'
import { readAltRecords, toAltByLocale } from './alts'

/**
 * Media named by ids as documents write them (`references.ts`), for the
 * media rule and for rendering figures: the media row and its written alt
 * text by locale. An id that is not a media id, or names deleted media, is
 * left out.
 */
export interface WrittenMedia {
  media: Doc<'media'>
  /** Only locales whose alt is written (never blank). */
  altByLocale: ReadonlyMap<Locale, string>
}

export async function readWrittenMedia(
  ctx: QueryCtx,
  writtenIds: readonly string[],
): Promise<Map<string, WrittenMedia>> {
  const entries = await Promise.all(
    [...new Set(writtenIds)].map(async (writtenId) => {
      const mediaId = ctx.db.normalizeId('media', writtenId)
      const media = mediaId === null ? null : await ctx.db.get(mediaId)
      if (media === null) {
        return null
      }
      const altByLocale = toAltByLocale(await readAltRecords(ctx, media._id))
      return [writtenId, { media, altByLocale }] as const
    }),
  )
  return new Map(entries.filter((entry) => entry !== null))
}
