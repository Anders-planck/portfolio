import { expect, test } from 'vitest'

import { toFaceNumber } from './to-face-number'

test('faces count from 01, on two digits', () => {
  expect(toFaceNumber(0)).toBe('01')
  expect(toFaceNumber(3)).toBe('04')
})
