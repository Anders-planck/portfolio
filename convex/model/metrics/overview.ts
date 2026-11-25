import { type Infer, v } from 'convex/values'

import type { QueryCtx } from '../../_generated/server'
import { formatMetricFigure, largeNumberStyleValidator } from './format'
import { readLargeNumberStyle, readLatestReading } from './readings'
import { automatedSourceValidator } from './sources'
import { metricStatusValidator, toMetricStatus } from './status'
import { metricDefinitionValidator } from './tables'

/**
 * What Fonti shows: every metric with its last verified figure (formatted for
 * the CMS, in Italian), its date, its evidence and its status.
 */

const CMS_LOCALE = 'it'

export const sourcesOverviewValidator = v.object({
  metrics: v.array(
    metricDefinitionValidator.extend({
      /** The last verified figure, formatted; null if there is none yet. */
      display: v.union(v.string(), v.null()),
      verifiedAt: v.union(v.number(), v.null()),
      evidence: v.union(v.string(), v.null()),
      status: metricStatusValidator,
    }),
  ),
  largeNumberStyle: largeNumberStyleValidator,
  isGithubTokenSet: v.boolean(),
})
export type SourcesOverview = Infer<typeof sourcesOverviewValidator>

/** The number of metrics Fonti lists at most; the site has a handful. */
const MAX_METRICS = 200

export async function readSourcesOverview(
  ctx: QueryCtx,
  isGithubTokenSet: boolean,
  now: number,
): Promise<SourcesOverview> {
  const largeNumberStyle = await readLargeNumberStyle(ctx)
  const metrics = await ctx.db.query('metrics').take(MAX_METRICS)
  const rows = await Promise.all(
    metrics.map(async (metric) => {
      const reading = await readLatestReading(ctx, metric._id)
      const figure =
        reading === null ? null : { value: reading.value, total: reading.total }
      return {
        key: metric.key,
        label: metric.label,
        format: metric.format,
        source: metric.source,
        display:
          figure === null
            ? null
            : formatMetricFigure(
                figure,
                metric.format,
                CMS_LOCALE,
                largeNumberStyle,
              ),
        verifiedAt: reading?.verifiedAt ?? null,
        evidence: reading?.evidence ?? null,
        status: toMetricStatus(
          metric.source,
          metric.lastAttempt,
          reading?.verifiedAt ?? null,
          now,
        ),
      }
    }),
  )
  return { metrics: rows, largeNumberStyle, isGithubTokenSet }
}

export const refreshTargetValidator = v.object({
  metricId: v.id('metrics'),
  source: automatedSourceValidator,
  lastAttemptedAt: v.union(v.number(), v.null()),
})

/** The automated metrics, with when each was last read. */
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
