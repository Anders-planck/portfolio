import { expect, test } from 'vitest'

import { toFrontFaceIndex, toTurnYawDegAtFace } from './to-turn-yaw-deg-at-face'

test('a turn snaps to the nearest face of the Block as scroll has it', () => {
  // Scroll has the Block at 20°; a drag of 50° leaves it at 70°, nearest 90°.
  expect(toTurnYawDegAtFace({ scrollYawDeg: 20, turnYawDeg: 50 }, 0)).toBe(70)
  // A drag of 20° leaves it at 40°, nearest 0°.
  expect(toTurnYawDegAtFace({ scrollYawDeg: 20, turnYawDeg: 20 }, 0)).toBe(-20)
})

test('one step forward brings the next face to the front', () => {
  const turnYawDeg = toTurnYawDegAtFace({ scrollYawDeg: 0, turnYawDeg: 0 }, 1)
  expect(toFrontFaceIndex(turnYawDeg)).toBe(1)
})

test('one step back from the first face brings the last face to the front', () => {
  const turnYawDeg = toTurnYawDegAtFace({ scrollYawDeg: 0, turnYawDeg: 0 }, -1)
  expect(toFrontFaceIndex(turnYawDeg)).toBe(3)
})

test('the front face is the one closest to facing the reader', () => {
  expect(toFrontFaceIndex(0)).toBe(0)
  expect(toFrontFaceIndex(-100)).toBe(1)
  expect(toFrontFaceIndex(-170)).toBe(2)
  expect(toFrontFaceIndex(95)).toBe(3)
  expect(toFrontFaceIndex(-720 - 90)).toBe(1)
})
