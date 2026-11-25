import { expect, test } from 'vitest'

import { formatNoteCount } from './format-note-count'

test('a count is grouped the way the page locale writes numbers', () => {
  expect(formatNoteCount(1234, 'de')).toBe('1.234')
  expect(formatNoteCount(1180, 'it')).toBe('1.180')
  expect(formatNoteCount(7, 'en')).toBe('7')
})
