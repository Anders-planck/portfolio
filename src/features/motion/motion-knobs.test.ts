import { expect, test } from 'vitest'

import { DEFAULT_MOTION_KNOBS, toMotionKnobsFromMotion } from './motion-knobs'

test('at tempo 1 the knobs are the defaults', () => {
  expect(toMotionKnobsFromMotion({ tempo: 1, character: 'standard' })).toEqual(
    DEFAULT_MOTION_KNOBS,
  )
})

test('tempo scales the stagger delay like every theme duration', () => {
  const slow = toMotionKnobsFromMotion({ tempo: 1.5, character: 'expressive' })
  expect(slow.staggerDelayMs).toBe(DEFAULT_MOTION_KNOBS.staggerDelayMs * 1.5)
  expect(slow.entryDistancePx).toBe(DEFAULT_MOTION_KNOBS.entryDistancePx)
})
