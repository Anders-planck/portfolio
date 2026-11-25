import { type Infer, v } from 'convex/values'

import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import { type Locale, LOCALES, localeValidator } from './locales'
import {
  EMPTY_PROFILE_CONTENT_FIELDS,
  EMPTY_PROFILE_FIELDS,
  pickProfileContentFields,
  type ProfileContentFields,
  profileContentFieldsValidator,
  profileFieldsValidator,
} from './profile'
import {
  type DocumentRef,
  localizedDocumentValidator,
  type Snapshot,
  toLocalizedDocumentFromSnapshot,
} from './snapshot'

/** A document has at most one content record per site locale. */
const MAX_LOCALE_RECORDS = LOCALES.length

/**
 * A live-save edit to one document: some shared fields and/or some fields of
 * one locale. Unknown documents and locales start from empty values.
 * (Function args must be one object, so new collections widen `collection`,
 * `fields` and `localeEdit` rather than adding union members.)
 */
export const draftEditValidator = v.object({
  collection: v.literal('profile'),
  key: v.string(),
  fields: v.optional(profileFieldsValidator.partial()),
  localeEdit: v.optional(
    v.object({
      locale: localeValidator,
      content: profileContentFieldsValidator.partial(),
    }),
  ),
})
export type DraftEdit = Infer<typeof draftEditValidator>

/** Applies a live-save edit to the draft, creating the document if needed. */
export async function saveDraftEdit(
  ctx: MutationCtx,
  edit: DraftEdit,
  savedAt: number,
) {
  const profile = await findOrCreateProfile(ctx, edit.key, savedAt)
  // Every save moves the revision, so publish can tell whether the draft the
  // owner reviewed is still the current one.
  const revision = profile.revision + 1
  await ctx.db.patch(profile._id, {
    ...edit.fields,
    revision,
    updatedAt: savedAt,
  })
  if (edit.localeEdit !== undefined) {
    await saveProfileContent(ctx, {
      profileId: profile._id,
      ...edit.localeEdit,
      savedAt,
    })
  }
  return { revision }
}

/** The revision of a document's draft (moves on every save), or null. */
export async function readDraftRevision(
  ctx: QueryCtx,
  { key }: DocumentRef,
): Promise<number | null> {
  const profile = await findProfile(ctx, key)
  return profile === null ? null : profile.revision
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
  const cvMediaId = profile.cvMediaId ?? null
  return {
    collection,
    key,
    fields: { name, email, links, isAvailable, skills, cvMediaId },
    content: records.map(toSnapshotContentFromProfileContent),
  }
}

/** Draft documents one read lists; well above the site's size. */
const MAX_DRAFT_DOCUMENTS = 1000

/** Every draft document as a snapshot (what Media counts as draft usage). */
export async function readAllDraftSnapshots(
  ctx: QueryCtx,
): Promise<Snapshot[]> {
  const profiles = await ctx.db.query('profile').take(MAX_DRAFT_DOCUMENTS)
  const snapshots = await Promise.all(
    profiles.map(({ key }) =>
      readDraftSnapshot(ctx, { collection: 'profile', key }),
    ),
  )
  return snapshots.filter((snapshot) => snapshot !== null)
}

function toSnapshotContentFromProfileContent(
  record: Doc<'profileContent'>,
): Snapshot['content'][number] {
  return { locale: record.locale, ...pickProfileContentFields(record) }
}

/**
 * What preview shows: the draft a token was issued for, `expired` (the owner
 * opens a new link) or `no-draft`. Tokens are checked in `preview.ts`.
 */
export const previewOutcomeValidator = v.union(
  v.object({
    status: v.literal('ready'),
    document: localizedDocumentValidator,
  }),
  v.object({ status: v.literal('expired') }),
  v.object({ status: v.literal('no-draft') }),
)
export type PreviewOutcome = Infer<typeof previewOutcomeValidator>

/** The draft of one document in one locale, as preview shows it. */
export async function readDraftPreview(
  ctx: QueryCtx,
  target: DocumentRef & { locale: Locale },
): Promise<PreviewOutcome> {
  const snapshot = await readDraftSnapshot(ctx, target)
  if (snapshot === null) {
    return { status: 'no-draft' }
  }
  return {
    status: 'ready',
    document: toLocalizedDocumentFromSnapshot(snapshot, target.locale),
  }
}

/**
 * What the CMS editor opens: the draft in one locale, starting from empty
 * values where nothing is saved yet. `revision` and `savedAt` are null
 * before the document's first save (there is nothing to publish).
 */
export const editableDraftValidator = v.object({
  revision: v.union(v.number(), v.null()),
  savedAt: v.union(v.number(), v.null()),
  fields: profileFieldsValidator,
  content: profileContentFieldsValidator,
})
export type EditableDraft = Infer<typeof editableDraftValidator>

export async function readEditableDraft(
  ctx: QueryCtx,
  target: DocumentRef & { locale: Locale },
): Promise<EditableDraft> {
  const profile = await findProfile(ctx, target.key)
  const snapshot = await readDraftSnapshot(ctx, target)
  if (profile === null || snapshot === null) {
    return {
      revision: null,
      savedAt: null,
      fields: EMPTY_PROFILE_FIELDS,
      content: EMPTY_PROFILE_CONTENT_FIELDS,
    }
  }
  const { fields, content } = toLocalizedDocumentFromSnapshot(
    snapshot,
    target.locale,
  )
  return {
    revision: profile.revision,
    savedAt: profile.updatedAt,
    fields,
    content: content ?? EMPTY_PROFILE_CONTENT_FIELDS,
  }
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
    return existing
  }
  const profile = {
    key,
    ...EMPTY_PROFILE_FIELDS,
    revision: 0,
    updatedAt: savedAt,
  }
  const profileId = await ctx.db.insert('profile', profile)
  return { _id: profileId, ...profile }
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
