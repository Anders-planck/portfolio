import { expect, test } from 'vitest'

import { toMagneticShift } from './to-magnetic-shift'

const BUTTON_RECT = { left: 100, top: 100, width: 80, height: 40 }
const OPTIONS = { radiusPx: 200, strength: 0.35 }

test('a pointer inside the radius pulls by a share of its offset', () => {
  expect(
    toMagneticShift(BUTTON_RECT, { left: 160, top: 130 }, OPTIONS),
  ).toEqual({ translateXPx: 20 * 0.35, translateYPx: 10 * 0.35 })
})

test('a pointer at or past the radius leaves the control in place', () => {
  expect(
    toMagneticShift(BUTTON_RECT, { left: 340, top: 120 }, OPTIONS),
  ).toBeUndefined()
})
