import { defineTable } from 'convex/server'
import { v } from 'convex/values'

import { localeValidator } from '../content/locales'
import { noteContentFieldsValidator, noteFieldsValidator } from './fields'

/** The most notes one read lists; the site has a handful. */
export const MAX_NOTES = 200

/**
 * The note drafts, spread into `convex/schema.ts`. Versions, releases and
 * published pointers are the content store's (ADR 0003).
 */
export const NOTES_TABLES = {
  /** Note draft: shared fields. */
  notes: defineTable({
    key: v.string(),
    ...noteFieldsValidator.fields,
    /** Moves on every save (of shared fields or any locale). */
    revision: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  /** Note draft: one record per locale. */
  noteContent: defineTable({
    noteId: v.id('notes'),
    locale: localeValidator,
    ...noteContentFieldsValidator.fields,
    updatedAt: v.number(),
  }).index('by_note_and_locale', ['noteId', 'locale']),

  /** When each note first went live (its public date); written once by publish. */
  noteFirstPublications: defineTable({
    key: v.string(),
    publishedAt: v.number(),
  }).index('by_key', ['key']),
}
