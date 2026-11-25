import type { QueryCtx } from '../../_generated/server'
import { MAX_METRICS } from '../metrics/tables'
import { type NoteSlugClaim, readNoteSlugClaims } from '../notes/slugclaims'
import { MAX_NOTES } from '../notes/tables'

/**
 * What the publish rules know beyond the document: the metric keys that
 * exist, so a reference to a missing metric blocks (ADR 0004); every slug a
 * note holds (draft, live or scheduled), so two notes never share an
 * address; how many note drafts exist, so the read cap is never passed.
 */
export interface RuleContext {
  metricKeys: ReadonlySet<string>
  noteSlugClaims: readonly NoteSlugClaim[]
  noteCount: number
}

export async function readRuleContext(ctx: QueryCtx): Promise<RuleContext> {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  const notes = await ctx.db.query('notes').take(MAX_NOTES + 1)
  return {
    metricKeys: new Set(metrics.map((metric) => metric.key)),
    noteSlugClaims: await readNoteSlugClaims(ctx),
    noteCount: notes.length,
  }
}
