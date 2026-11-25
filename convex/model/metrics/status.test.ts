import { expect, test } from 'vitest'

import type { Source } from './sources'
import { isRefreshDue, MANUAL_READING_TTL_MS, toMetricStatus } from './status'

const NOW = Date.UTC(2026, 10, 25, 12)
const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const MANUAL: Source = { kind: 'manual' }
const NPM: Source = {
  kind: 'npm',
  packageName: 'some-package',
  cadence: 'daily',
}

test('a manual count is ok for ninety days, then it must be counted again', () => {
  const countedAt = NOW - MANUAL_READING_TTL_MS

  expect(toMetricStatus(MANUAL, null, countedAt + 1, NOW)).toEqual({
    kind: 'ok',
  })
  expect(toMetricStatus(MANUAL, null, countedAt, NOW)).toEqual({
    kind: 'expired',
    expiredAt: NOW,
  })
  expect(MANUAL_READING_TTL_MS).toBe(90 * DAY_MS)
})

test('a metric with no verified reading awaits its first one', () => {
  expect(toMetricStatus(MANUAL, null, null, NOW)).toEqual({
    kind: 'awaiting-reading',
  })
  expect(toMetricStatus(NPM, null, null, NOW)).toEqual({
    kind: 'awaiting-reading',
  })
})

test('a source whose last read failed is failing, with when and why', () => {
  const attempt = {
    attemptedAt: NOW - HOUR_MS,
    outcome: { kind: 'failed', reason: { kind: 'http', status: 503 } },
  } as const

  expect(toMetricStatus(NPM, attempt, NOW - DAY_MS, NOW)).toEqual({
    kind: 'failing',
    failedAt: NOW - HOUR_MS,
    reason: { kind: 'http', status: 503 },
  })
})

test('a source read fine last time is ok', () => {
  const attempt = {
    attemptedAt: NOW - HOUR_MS,
    outcome: { kind: 'ok' },
  } as const

  expect(toMetricStatus(NPM, attempt, NOW - HOUR_MS, NOW)).toEqual({
    kind: 'ok',
  })
})

test('a daily source is due a day after its last read, a weekly one a week after', () => {
  const daily = { kind: 'npm', packageName: 'pkg', cadence: 'daily' } as const
  const weekly = { ...daily, cadence: 'weekly' } as const

  expect(isRefreshDue(daily, null, NOW)).toBe(true)
  expect(isRefreshDue(daily, NOW - 2 * HOUR_MS, NOW)).toBe(false)
  expect(isRefreshDue(daily, NOW - DAY_MS, NOW)).toBe(true)
  expect(isRefreshDue(weekly, NOW - DAY_MS, NOW)).toBe(false)
  expect(isRefreshDue(weekly, NOW - 7 * DAY_MS, NOW)).toBe(true)
})
