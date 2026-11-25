import { expect, test } from 'vitest'

import { formatNoteDate } from './format-note-date'
import { PUBLISHED_AT } from './note.fixture'

test('a note date is written the way each locale writes dates', () => {
  expect(formatNoteDate(PUBLISHED_AT, 'it')).toBe('24 nov 2026')
  expect(formatNoteDate(PUBLISHED_AT, 'en')).toBe('Nov 24, 2026')
})
