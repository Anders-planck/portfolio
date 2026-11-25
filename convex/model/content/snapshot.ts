import { type Infer, v } from 'convex/values'

import { type Locale, localeValidator } from './locales'
import {
  pickProfileContentFields,
  profileContentFieldsValidator,
  profileFieldsValidator,
} from './profile'

/** Collections the store knows. Each one adds a literal and a snapshot shape. */
export const collectionValidator = v.union(v.literal('profile'))
export type Collection = Infer<typeof collectionValidator>

const COLLECTIONS: readonly Collection[] = ['profile']

export function isCollection(value: unknown): value is Collection {
  return COLLECTIONS.some((collection) => collection === value)
}

export const documentRefValidator = v.object({
  collection: collectionValidator,
  key: v.string(),
})
export type DocumentRef = Infer<typeof documentRefValidator>

/** A document picked for publish, with the draft revision the owner reviewed. */
export const reviewedDraftValidator = documentRefValidator.extend({
  revision: v.number(),
})
export type ReviewedDraft = Infer<typeof reviewedDraftValidator>

/**
 * A whole document at one point in time: shared fields plus every locale.
 * Versions store it, rules read it, preview and the public site render it.
 */
export const snapshotValidator = v.union(
  v.object({
    collection: v.literal('profile'),
    key: v.string(),
    fields: profileFieldsValidator,
    content: v.array(
      profileContentFieldsValidator.extend({ locale: localeValidator }),
    ),
  }),
)
export type Snapshot = Infer<typeof snapshotValidator>

/** One document as one locale sees it; `content` is null if that locale has none. */
export const localizedDocumentValidator = v.union(
  v.object({
    collection: v.literal('profile'),
    key: v.string(),
    locale: localeValidator,
    fields: profileFieldsValidator,
    content: v.union(profileContentFieldsValidator, v.null()),
  }),
)
export type LocalizedDocument = Infer<typeof localizedDocumentValidator>

export function toLocalizedDocumentFromSnapshot(
  snapshot: Snapshot,
  locale: Locale,
): LocalizedDocument {
  const { collection, key, fields } = snapshot
  const record = snapshot.content.find((entry) => entry.locale === locale)
  if (record === undefined) {
    return { collection, key, locale, fields, content: null }
  }
  const content = pickProfileContentFields(record)
  return { collection, key, locale, fields, content }
}
