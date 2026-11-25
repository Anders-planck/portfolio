import type { QueryCtx } from '../../_generated/server'
import { readRuleMedia, type RuleMedia } from '../media/rulemedia'
import { MAX_METRICS } from '../metrics/tables'
import { readNoteDrafts } from '../notes/drafts'
import { type NoteSlugClaim, readNoteSlugClaims } from '../notes/slugclaims'
import type { Snapshot } from './snapshot'

/**
 * What the publish rules know beyond the document: the metric keys that
 * exist, so a reference to a missing metric blocks (ADR 0004); every slug a
 * note holds (draft, live or scheduled), so two notes never share an
 * address; how many note drafts exist, so the read cap is never passed; and
 * the media the documents point at, with the locales that have alt text.
 */
export interface RuleContext {
  metricKeys: ReadonlySet<string>
  noteSlugClaims: readonly NoteSlugClaim[]
  noteCount: number
  /** Media the documents of the publish point at, by the id as written; a
   * missing or malformed id is absent. */
  media: ReadonlyMap<string, RuleMedia>
}

export async function readRuleContext(
  ctx: QueryCtx,
  snapshots: Snapshot[],
): Promise<RuleContext> {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  const notes = await readNoteDrafts(ctx)
  return {
    metricKeys: new Set(metrics.map((metric) => metric.key)),
    noteSlugClaims: await readNoteSlugClaims(ctx, notes),
    noteCount: notes.length,
    media: await readRuleMedia(ctx, snapshots),
  }
}
