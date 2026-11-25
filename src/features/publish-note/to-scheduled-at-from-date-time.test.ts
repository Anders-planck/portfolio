import { expect, test } from 'vitest'

import { toScheduledAtFromDateTime } from './to-scheduled-at-from-date-time'

const NOW = new Date('2026-11-25T10:00').getTime()

test('a future time in the owner’s time zone is a scheduled instant', () => {
  expect(toScheduledAtFromDateTime('2026-11-26T09:30', NOW)).toEqual({
    kind: 'future',
    scheduledAt: new Date('2026-11-26T09:30').getTime(),
  })
})

test('a time already passed cannot be scheduled', () => {
  expect(toScheduledAtFromDateTime('2026-11-25T10:00', NOW)).toEqual({
    kind: 'past',
  })
})

test('no time, or one that does not parse, is no choice yet', () => {
  expect(toScheduledAtFromDateTime(undefined, NOW)).toEqual({ kind: 'none' })
  expect(toScheduledAtFromDateTime('domani', NOW)).toEqual({ kind: 'none' })
})
