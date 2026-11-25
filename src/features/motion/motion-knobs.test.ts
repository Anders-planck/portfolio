import { expect, test } from 'vitest'

import { DEFAULT_MOTION_KNOBS, toMotionKnobsFromTempo } from './motion-knobs'

test('at tempo 1 the knobs are the defaults', () => {
  expect(toMotionKnobsFromTempo(1)).toEqual(DEFAULT_MOTION_KNOBS)
})

test('tempo scales the stagger delay like every theme duration', () => {
  const slow = toMotionKnobsFromTempo(1.5)
  expect(slow.staggerDelayMs).toBe(DEFAULT_MOTION_KNOBS.staggerDelayMs * 1.5)
  expect(slow.entryDistancePx).toBe(DEFAULT_MOTION_KNOBS.entryDistancePx)
})
