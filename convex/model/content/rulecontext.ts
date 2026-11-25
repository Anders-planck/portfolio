import type { QueryCtx } from '../../_generated/server'
import { MAX_METRICS } from '../metrics/tables'
import { MAX_NOTES } from '../notes/tables'

/**
 * What the publish rules know beyond the document: the metric keys that
 * exist, so a reference to a missing metric blocks (ADR 0004), and the slug
 * of every note draft by key, so two notes never share an address.
 */
export interface RuleContext {
  metricKeys: ReadonlySet<string>
  noteSlugs: ReadonlyMap<string, string>
}

export async function readRuleContext(ctx: QueryCtx): Promise<RuleContext> {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  const notes = await ctx.db.query('notes').take(MAX_NOTES)
  return {
    metricKeys: new Set(metrics.map((metric) => metric.key)),
    noteSlugs: new Map(notes.map((note) => [note.key, note.slug])),
  }
}
