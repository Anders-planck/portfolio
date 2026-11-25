import { defineTable } from 'convex/server'
import { type Infer, v } from 'convex/values'

import { attemptValidator } from './attempts'
import { largeNumberStyleValidator, metricFormatValidator } from './format'
import { sourceValidator } from './sources'

/**
 * The metrics tables (ADR 0004), spread into `convex/schema.ts`. Metrics are
 * live data, not released content: a new reading shows on the site at once.
 */

export const metricDefinitionValidator = v.object({
  /** What `{{m:<key>}}` names. Never changes once created. */
  key: v.string(),
  /** What it measures, for the CMS ("download/anno SDK e-receipts"). */
  label: v.string(),
  format: metricFormatValidator,
  source: sourceValidator,
})
export type MetricDefinition = Infer<typeof metricDefinitionValidator>

/** The most metrics one read lists; the site has a handful. */
export const MAX_METRICS = 200

export const METRICS_TABLES = {
  metrics: defineTable({
    ...metricDefinitionValidator.fields,
    /** The last read of an automated source; null for manual ones. */
    lastAttempt: v.union(attemptValidator, v.null()),
    createdAt: v.number(),
  }).index('by_key', ['key']),

  /** Verified figures only, oldest to newest: a failed read writes none. */
  metricReadings: defineTable({
    metricId: v.id('metrics'),
    value: v.number(),
    total: v.union(v.number(), v.null()),
    /** When the refresh read the source, or the day a manual count was made. */
    verifiedAt: v.number(),
    /** How a manual count was made; null for automated sources. */
    evidence: v.union(v.string(), v.null()),
    recordedAt: v.number(),
  }).index('by_metric_and_verified_at', ['metricId', 'verifiedAt']),

  /** One row: how figures are rounded when rendered. */
  metricSettings: defineTable({ largeNumberStyle: largeNumberStyleValidator }),
}
