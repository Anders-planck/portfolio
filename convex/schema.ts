import { defineSchema, defineTable } from 'convex/server'
import { appearanceValidator } from './lib/appearance'

// Content tables arrive with the content store (ticket 03).
export default defineSchema({
  // One row: the published theme and motion params (ADR 0010). A stand-in
  // until the content store gives `theme` and `motion` drafts and releases.
  siteSettings: defineTable(appearanceValidator),
})
