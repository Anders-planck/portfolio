import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { vLocale } from './content/locales'
import { vProfileContentFields, vProfileFields } from './content/profile'
import { vDocumentFinding } from './content/rules'
import { vCollection, vSnapshot } from './content/snapshot'

export default defineSchema({
  // Content store (ADR 0003). Drafts live in one table per collection; the
  // store owns versions, releases and the published pointers.

  /** Profile draft: shared fields. */
  profile: defineTable({
    key: v.string(),
    ...vProfileFields.fields,
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  /** Profile draft: one record per locale. */
  profileContent: defineTable({
    profileId: v.id('profile'),
    locale: vLocale,
    ...vProfileContentFields.fields,
    updatedAt: v.number(),
  }).index('by_profile_and_locale', ['profileId', 'locale']),

  /** Immutable snapshot of one document (all locales), written by publish. */
  versions: defineTable({
    collection: vCollection,
    key: v.string(),
    snapshot: vSnapshot,
    createdAt: v.number(),
  }).index('by_collection_and_key', ['collection', 'key']),

  /** Versions made live together by one publish (or a rollback). */
  releases: defineTable({
    versionIds: v.array(v.id('versions')),
    note: v.string(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('published'),
      v.literal('failed'),
    ),
    scheduledAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    rolledBackFrom: v.optional(v.id('releases')),
    /** Rule findings at publish: warnings, or the blocks that failed it. */
    findings: v.array(vDocumentFinding),
  }),

  /** What the public site reads: the live version of each document. */
  publishedPointers: defineTable({
    collection: vCollection,
    key: v.string(),
    versionId: v.id('versions'),
    releaseId: v.id('releases'),
  }).index('by_collection_and_key', ['collection', 'key']),
})
