import { expect, test } from 'vitest'

import { NOTE_ROWS } from '../../entities/note/note-draft.fixture'
import { countRowsByStatus, isStatusFilter } from './status-filter'

test('each filter counts the notes it shows', () => {
  expect(countRowsByStatus(NOTE_ROWS, 'all')).toBe(2)
  expect(countRowsByStatus(NOTE_ROWS, 'published')).toBe(1)
  expect(countRowsByStatus(NOTE_ROWS, 'scheduled')).toBe(0)
})

test('only the known filters are filters', () => {
  expect(isStatusFilter('draft')).toBe(true)
  expect(isStatusFilter('trash')).toBe(false)
})
