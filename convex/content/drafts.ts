import { type Infer, v } from 'convex/values'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { vLocale } from './locales'
import {
  emptyProfileContentFields,
  emptyProfileFields,
  vProfileContentFields,
  vProfileFields,
} from './profile'
import type { Collection, Snapshot } from './snapshot'

/**
 * A live-save edit to one document: some shared fields and/or some fields of
 * one locale. Unknown documents and locales start from empty values.
 * (Function args must be one object, so new collections widen `collection`,
 * `fields` and `content` rather than adding union members.)
 */
export const vDraftEdit = v.object({
  collection: v.literal('profile'),
  key: v.string(),
  fields: v.optional(vProfileFields.partial()),
  locale: v.optional(vLocale),
  content: v.optional(vProfileContentFields.partial()),
})
export type DraftEdit = Infer<typeof vDraftEdit>

export async function writeDraft(
  ctx: MutationCtx,
  edit: DraftEdit,
  at: number,
) {
  if (edit.content && !edit.locale) {
    throw new Error('A content edit needs a locale')
  }

  const existing = await ctx.db
    .query('profile')
    .withIndex('by_key', (q) => q.eq('key', edit.key))
    .unique()
  const profileId = existing
    ? existing._id
    : await ctx.db.insert('profile', {
        key: edit.key,
        ...emptyProfileFields,
        updatedAt: at,
      })
  await ctx.db.patch(profileId, { ...edit.fields, updatedAt: at })

  if (edit.locale && edit.content) {
    const locale = edit.locale
    const record = await ctx.db
      .query('profileContent')
      .withIndex('by_profile_and_locale', (q) =>
        q.eq('profileId', profileId).eq('locale', locale),
      )
      .unique()
    if (record) {
      await ctx.db.patch(record._id, { ...edit.content, updatedAt: at })
    } else {
      await ctx.db.insert('profileContent', {
        profileId,
        locale,
        ...emptyProfileContentFields,
        ...edit.content,
        updatedAt: at,
      })
    }
  }
}

/** The current draft of a document as a snapshot, or null if it has none. */
export async function readDraft(
  ctx: QueryCtx,
  collection: Collection,
  key: string,
): Promise<Snapshot | null> {
  switch (collection) {
    case 'profile': {
      const doc = await ctx.db
        .query('profile')
        .withIndex('by_key', (q) => q.eq('key', key))
        .unique()
      if (!doc) return null
      const records = await ctx.db
        .query('profileContent')
        .withIndex('by_profile_and_locale', (q) => q.eq('profileId', doc._id))
        .take(8)
      const { _id, _creationTime, key: _key, updatedAt, ...fields } = doc
      return {
        collection,
        key,
        fields,
        content: records.map(
          ({ _id, _creationTime, profileId, updatedAt, ...content }) => content,
        ),
      }
    }
  }
}
