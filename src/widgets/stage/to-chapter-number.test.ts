import { expect, test } from 'vitest'

import { toChapterNumber } from './to-chapter-number'

test('the opening is chapter 00', () => {
  expect(toChapterNumber(0)).toBe('00')
})

test('chapter numbers have two digits', () => {
  expect(toChapterNumber(5)).toBe('05')
  expect(toChapterNumber(12)).toBe('12')
})
