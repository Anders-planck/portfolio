import type { Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'
import { readRuleMedia, type RuleMedia } from '../media/rulemedia'
import { MAX_METRICS } from '../metrics/tables'
import type { Snapshot } from './snapshot'

/**
 * What the publish rules know beyond the document: the metric keys that
 * exist, so a reference to a missing metric blocks (ADR 0004), and the
 * media the documents point at, with the locales that have alt text.
 */
export interface RuleContext {
  metricKeys: ReadonlySet<string>
  /** Only media some document of the publish points at; a missing id is absent. */
  media: ReadonlyMap<Id<'media'>, RuleMedia>
}

export async function readRuleContext(
  ctx: QueryCtx,
  snapshots: Snapshot[],
): Promise<RuleContext> {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  return {
    metricKeys: new Set(metrics.map((metric) => metric.key)),
    media: await readRuleMedia(ctx, snapshots),
  }
}
