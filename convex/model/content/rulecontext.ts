import type { QueryCtx } from '../../_generated/server'
import { MAX_METRICS } from '../metrics/tables'

/**
 * What the publish rules know beyond the document: the metric keys that
 * exist, so a reference to a missing metric blocks (ADR 0004).
 */
export interface RuleContext {
  metricKeys: ReadonlySet<string>
}

export async function readRuleContext(ctx: QueryCtx): Promise<RuleContext> {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  return { metricKeys: new Set(metrics.map((metric) => metric.key)) }
}
