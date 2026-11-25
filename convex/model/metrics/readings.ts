import type { Doc, Id } from '../../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../_generated/server'
import type { SourceReading } from './attempts'
import type { LargeNumberStyle } from './format'

/**
 * Readings and the rounding setting in the database. Only a verified figure
 * becomes a reading; a failed read only moves the metric's `lastAttempt`.
 */

/** Rounding the site starts with: the mockup's «10k+» above ten thousand. */
const DEFAULT_LARGE_NUMBER_STYLE: LargeNumberStyle = 'compact'

export async function findMetricByKey(ctx: QueryCtx, key: string) {
  return ctx.db
    .query('metrics')
    .withIndex('by_key', (query) => query.eq('key', key))
    .unique()
}

export async function readLatestReading(
  ctx: QueryCtx,
  metricId: Id<'metrics'>,
): Promise<Doc<'metricReadings'> | null> {
  return ctx.db
    .query('metricReadings')
    .withIndex('by_metric_and_verified_at', (query) =>
      query.eq('metricId', metricId),
    )
    .order('desc')
    .first()
}

/** Records one read of an automated source: its attempt and, if verified, the figure. */
export async function recordReading(
  ctx: MutationCtx,
  metricId: Id<'metrics'>,
  attemptedAt: number,
  reading: SourceReading,
) {
  if (reading.kind === 'failed') {
    await ctx.db.patch(metricId, {
      lastAttempt: { attemptedAt, outcome: reading },
    })
    return
  }
  await ctx.db.insert('metricReadings', {
    metricId,
    ...reading.figure,
    verifiedAt: attemptedAt,
    evidence: null,
    recordedAt: attemptedAt,
  })
  await ctx.db.patch(metricId, {
    lastAttempt: { attemptedAt, outcome: { kind: 'ok' } },
  })
}

export async function readLargeNumberStyle(
  ctx: QueryCtx,
): Promise<LargeNumberStyle> {
  const settings = await ctx.db.query('metricSettings').first()
  return settings?.largeNumberStyle ?? DEFAULT_LARGE_NUMBER_STYLE
}

export async function saveLargeNumberStyle(
  ctx: MutationCtx,
  largeNumberStyle: LargeNumberStyle,
) {
  const settings = await ctx.db.query('metricSettings').first()
  if (settings === null) {
    await ctx.db.insert('metricSettings', { largeNumberStyle })
    return
  }
  await ctx.db.patch(settings._id, { largeNumberStyle })
}
