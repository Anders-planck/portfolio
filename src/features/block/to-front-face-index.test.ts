import { expect, test } from 'vitest'

import { toFrontFaceIndex } from './to-front-face-index'

test('the front face is the one closest to facing the reader', () => {
  expect(toFrontFaceIndex(0)).toBe(0)
  expect(toFrontFaceIndex(-100)).toBe(1)
  expect(toFrontFaceIndex(-170)).toBe(2)
  expect(toFrontFaceIndex(95)).toBe(3)
  expect(toFrontFaceIndex(-720 - 90)).toBe(1)
})
