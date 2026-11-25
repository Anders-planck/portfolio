import { expect, test } from 'vitest'

import { toReadPercent } from './use-reading-progress'

const VIEWPORT = 800

test('nothing is read while the article starts below the top', () => {
  expect(toReadPercent({ top: 120, height: 3000 }, VIEWPORT)).toBe(0)
})

test('the read share grows with the scrolled part of the article', () => {
  expect(toReadPercent({ top: -1100, height: 3000 }, VIEWPORT)).toBe(50)
})

test('the end of the article in view is all read, and never more', () => {
  expect(toReadPercent({ top: -2200, height: 3000 }, VIEWPORT)).toBe(100)
  expect(toReadPercent({ top: -9000, height: 3000 }, VIEWPORT)).toBe(100)
})

test('a short article is read once its end is in view', () => {
  expect(toReadPercent({ top: 100, height: 500 }, VIEWPORT)).toBe(100)
  expect(toReadPercent({ top: 500, height: 500 }, VIEWPORT)).toBe(0)
})
