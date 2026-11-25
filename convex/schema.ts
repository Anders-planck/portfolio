import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

import { appearanceValidator } from './model/appearance'
import { localeValidator } from './model/content/locales'
import {
  profileContentFieldsValidator,
  profileFieldsValidator,
} from './model/content/profile'
import { releaseValidator } from './model/content/releases'
import {
  collectionValidator,
  snapshotValidator,
} from './model/content/snapshot'

export default defineSchema({
  // One row: the published theme and motion params (ADR 0010). A stand-in
  // until the content store gives `theme` and `motion` drafts and releases
  // (ticket 16 moves it into the content store).
  appearance: defineTable(appearanceValidator),

  // Content store (ADR 0003). Drafts live in one table per collection; the
  // store owns versions, releases and the published pointers.

  /** Profile draft: shared fields. */
  profile: defineTable({
    key: v.string(),
    ...profileFieldsValidator.fields,
    /** Moves on every save (of shared fields or any locale). */
    revision: v.number(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  /** Profile draft: one record per locale. */
  profileContent: defineTable({
    profileId: v.id('profile'),
    locale: localeValidator,
    ...profileContentFieldsValidator.fields,
    updatedAt: v.number(),
  }).index('by_profile_and_locale', ['profileId', 'locale']),

  /** Immutable snapshot of one document (all locales), written by publish. */
  versions: defineTable({
    collection: collectionValidator,
    key: v.string(),
    snapshot: snapshotValidator,
    createdAt: v.number(),
  }).index('by_collection_and_key', ['collection', 'key']),

  /** Versions made live together by one publish (or a rollback). */
  releases: defineTable(releaseValidator).index('by_request_id', ['requestId']),

  /** What the public site reads: the live version of each document. */
  publishedPointers: defineTable({
    collection: collectionValidator,
    key: v.string(),
    versionId: v.id('versions'),
    releaseId: v.id('releases'),
  }).index('by_collection_and_key', ['collection', 'key']),
})
