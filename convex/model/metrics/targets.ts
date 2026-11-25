import { v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { automatedSourceValidator } from './sources'
import { MAX_METRICS } from './tables'

/** What the refresh reads: each automated metric and when it was last read. */
export const refreshTargetValidator = v.object({
  metricId: v.id('metrics'),
  source: automatedSourceValidator,
  lastAttemptedAt: v.union(v.number(), v.null()),
})

export async function listAutomatedMetrics(ctx: QueryCtx) {
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  return metrics.flatMap((metric) =>
    metric.source.kind === 'manual'
      ? []
      : [
          {
            metricId: metric._id,
            source: metric.source,
            lastAttemptedAt: metric.lastAttempt?.attemptedAt ?? null,
          },
        ],
  )
}
