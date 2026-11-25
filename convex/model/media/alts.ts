import { ConvexError } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { type Locale, LOCALES } from '../content/locales'
import { toMediaKindFromMime } from './files'

/**
 * Alt text per locale (story 41). The owner's own words are `reviewed`;
 * the AI assistant (ticket 14) will write `to-review` ones.
 */

/** Screen readers read alt in one breath; longer belongs in a caption. */
export const MAX_ALT_LENGTH = 300

export function readAltRecords(
  ctx: QueryCtx,
  mediaId: Id<'media'>,
): Promise<Doc<'mediaAlt'>[]> {
  return ctx.db
    .query('mediaAlt')
    .withIndex('by_media_and_locale', (query) => query.eq('mediaId', mediaId))
    .take(LOCALES.length)
}

/**
 * Saves the owner's alt for one locale; saving the same text again is
 * harmless (DATA-06). Only images take alt text.
 */
export async function saveOwnerAlt(
  ctx: MutationCtx,
  edit: { mediaId: Id<'media'>; locale: Locale; alt: string },
  now: number,
) {
  const media = await ctx.db.get(edit.mediaId)
  if (media === null || toMediaKindFromMime(media.mime) !== 'image') {
    throw new ConvexError({
      code: 'INVALID_ALT_EDIT',
      message: 'Alt text belongs to an existing image',
    })
  }
  const alt = edit.alt.trim()
  if (alt.length > MAX_ALT_LENGTH) {
    throw new ConvexError({
      code: 'INVALID_ALT_EDIT',
      message: `Alt text holds at most ${String(MAX_ALT_LENGTH)} characters`,
    })
  }
  const record = await ctx.db
    .query('mediaAlt')
    .withIndex('by_media_and_locale', (query) =>
      query.eq('mediaId', edit.mediaId).eq('locale', edit.locale),
    )
    .unique()
  const fields = { alt, reviewState: 'reviewed' as const, updatedAt: now }
  if (record === null) {
    await ctx.db.insert('mediaAlt', {
      mediaId: edit.mediaId,
      locale: edit.locale,
      ...fields,
    })
  } else {
    await ctx.db.patch(record._id, fields)
  }
  return { savedAt: now }
}
