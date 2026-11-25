import { type Infer, v } from 'convex/values'

import { type Attempt, failureReasonValidator } from './attempts'
import type { AutomatedSource, Cadence, Source } from './sources'

/**
 * A metric's status and refresh timing (pure). The status never hides the
 * last verified reading: a failing or expired metric still shows it, with its
 * date; only a metric with no reading at all has nothing to show.
 */

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

/** A manual count expires after 90 days and becomes a warning (ADR 0004). */
export const MANUAL_READING_TTL_MS = 90 * DAY_MS

// The cron runs once a day and its start time drifts, so a source becomes
// due an hour before its full interval has passed.
const REFRESH_SLACK_MS = HOUR_MS
const REFRESH_INTERVAL_MS: Record<Cadence, number> = {
  daily: DAY_MS,
  weekly: 7 * DAY_MS,
}

export const metricStatusValidator = v.union(
  v.object({ kind: v.literal('ok') }),
  v.object({ kind: v.literal('awaiting-reading') }),
  v.object({
    kind: v.literal('failing'),
    failedAt: v.number(),
    reason: failureReasonValidator,
  }),
  v.object({ kind: v.literal('expired'), expiredAt: v.number() }),
)
export type MetricStatus = Infer<typeof metricStatusValidator>

export function toMetricStatus(
  source: Source,
  lastAttempt: Attempt | null,
  verifiedAt: number | null,
  now: number,
): MetricStatus {
  if (lastAttempt?.outcome.kind === 'failed') {
    return {
      kind: 'failing',
      failedAt: lastAttempt.attemptedAt,
      reason: lastAttempt.outcome.reason,
    }
  }
  if (verifiedAt === null) {
    return { kind: 'awaiting-reading' }
  }
  const expiredAt = verifiedAt + MANUAL_READING_TTL_MS
  if (source.kind === 'manual' && expiredAt <= now) {
    return { kind: 'expired', expiredAt }
  }
  return { kind: 'ok' }
}

/**
 * Due when the last verified reading is a cadence old, so a failed read is
 * tried again on the next daily run, even for a weekly source.
 */
export function isRefreshDue(
  source: AutomatedSource,
  lastVerifiedAt: number | null,
  now: number,
) {
  if (lastVerifiedAt === null) {
    return true
  }
  const interval = REFRESH_INTERVAL_MS[source.cadence]
  return now - lastVerifiedAt >= interval - REFRESH_SLACK_MS
}
