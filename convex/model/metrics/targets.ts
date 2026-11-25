import { v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { readLatestReading } from './readings'
import { automatedSourceValidator } from './sources'
import { MAX_METRICS } from './tables'

/** What the refresh reads: each automated metric and when it was last read. */
export const refreshTargetValidator = v.object({
  metricId: v.id('metrics'),
  source: automatedSourceValidator,
  /** The last verified reading: a failed read leaves the source due. */
  lastVerifiedAt: v.union(v.number(), v.null()),
})

export async function listAutomatedMetrics(ctx: QueryCtx) {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  const targets = await Promise.all(
    metrics.map(async ({ _id: metricId, source }) => {
      if (source.kind === 'manual') {
        return []
      }
      const reading = await readLatestReading(ctx, metricId)
      return [{ metricId, source, lastVerifiedAt: reading?.verifiedAt ?? null }]
    }),
  )
  return targets.flat()
}
