import { type Infer, v } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { type Locale, localeValidator } from './locales'
import { verifyPreviewToken } from './preview'
import {
  EMPTY_PROFILE_CONTENT_FIELDS,
  EMPTY_PROFILE_FIELDS,
  type ProfileContentFields,
  profileContentFieldsValidator,
  profileFieldsValidator,
} from './profile'
import {
  type DocumentRef,
  type LocalizedDocument,
  type Snapshot,
  toLocalizedDocumentFromSnapshot,
} from './snapshot'

/** Upper bound of locale records per document (four site locales). */
const MAX_LOCALE_RECORDS = 8

/**
 * A live-save edit to one document: some shared fields and/or some fields of
 * one locale. Unknown documents and locales start from empty values.
 * (Function args must be one object, so new collections widen `collection`,
 * `fields` and `content` rather than adding union members.)
 */
export const draftEditValidator = v.object({
  collection: v.literal('profile'),
  key: v.string(),
  fields: v.optional(profileFieldsValidator.partial()),
  locale: v.optional(localeValidator),
  content: v.optional(profileContentFieldsValidator.partial()),
})
export type DraftEdit = Infer<typeof draftEditValidator>

/** Applies a live-save edit to the draft, creating the document if needed. */
export async function saveDraftEdit(
  ctx: MutationCtx,
  edit: DraftEdit,
  savedAt: number,
) {
  if (edit.content !== undefined && edit.locale === undefined) {
    throw new Error('A content edit needs a locale')
  }
  const profileId = await findOrCreateProfile(ctx, edit.key, savedAt)
  await ctx.db.patch(profileId, { ...edit.fields, updatedAt: savedAt })
  if (edit.locale !== undefined && edit.content !== undefined) {
    await saveProfileContent(ctx, {
      profileId,
      locale: edit.locale,
      content: edit.content,
      savedAt,
    })
  }
}

/** The current draft of a document as a snapshot, or null if it has none. */
export async function readDraftSnapshot(
  ctx: QueryCtx,
  { collection, key }: DocumentRef,
): Promise<Snapshot | null> {
  const profile = await findProfile(ctx, key)
  if (profile === null) {
    return null
  }
  const records = await ctx.db
    .query('profileContent')
    .withIndex('by_profile_and_locale', (query) =>
      query.eq('profileId', profile._id),
    )
    .take(MAX_LOCALE_RECORDS)
  const { name, email, links, isAvailable, skills } = profile
  return {
    collection,
    key,
    fields: { name, email, links, isAvailable, skills },
    content: records.map(toSnapshotContentFromProfileContent),
  }
}

function toSnapshotContentFromProfileContent(
  record: Doc<'profileContent'>,
): Snapshot['content'][number] {
  return {
    locale: record.locale,
    statusLabel: record.statusLabel,
    availabilityLabel: record.availabilityLabel,
    titleLine1: record.titleLine1,
    titleLine2: record.titleLine2,
    subtitle: record.subtitle,
    contactLabel: record.contactLabel,
    languages: record.languages,
  }
}

/** The draft a preview token was issued for; null if the token is bad or expired. */
export async function readDraftForPreview(
  ctx: QueryCtx,
  token: string,
  verification: { secret: string; now: number },
): Promise<LocalizedDocument | null> {
  const claims = await verifyPreviewToken(token, verification)
  if (claims === null) {
    return null
  }
  const snapshot = await readDraftSnapshot(ctx, claims)
  return snapshot === null
    ? null
    : toLocalizedDocumentFromSnapshot(snapshot, claims.locale)
}

function findProfile(ctx: QueryCtx, key: string) {
  return ctx.db
    .query('profile')
    .withIndex('by_key', (query) => query.eq('key', key))
    .unique()
}

async function findOrCreateProfile(
  ctx: MutationCtx,
  key: string,
  savedAt: number,
) {
  const existing = await findProfile(ctx, key)
  if (existing !== null) {
    return existing._id
  }
  return ctx.db.insert('profile', {
    key,
    ...EMPTY_PROFILE_FIELDS,
    updatedAt: savedAt,
  })
}

async function saveProfileContent(
  ctx: MutationCtx,
  edit: {
    profileId: Id<'profile'>
    locale: Locale
    content: Partial<ProfileContentFields>
    savedAt: number
  },
) {
  const { profileId, locale, content, savedAt } = edit
  const record = await ctx.db
    .query('profileContent')
    .withIndex('by_profile_and_locale', (query) =>
      query.eq('profileId', profileId).eq('locale', locale),
    )
    .unique()
  if (record !== null) {
    await ctx.db.patch(record._id, { ...content, updatedAt: savedAt })
    return
  }
  await ctx.db.insert('profileContent', {
    profileId,
    locale,
    ...EMPTY_PROFILE_CONTENT_FIELDS,
    ...content,
    updatedAt: savedAt,
  })
}
