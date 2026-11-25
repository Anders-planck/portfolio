import { expect, test } from 'vitest'

import { NOTE_ROWS } from '../../entities/note/note-draft.fixture'
import { filterRowsByStatus, isStatusFilter } from './status-filter'

test('each filter shows the notes in its state', () => {
  expect(filterRowsByStatus(NOTE_ROWS, 'all')).toHaveLength(2)
  expect(filterRowsByStatus(NOTE_ROWS, 'published')).toHaveLength(1)
  expect(filterRowsByStatus(NOTE_ROWS, 'scheduled')).toHaveLength(0)
})

test('only the known filters are filters', () => {
  expect(isStatusFilter('draft')).toBe(true)
  expect(isStatusFilter('trash')).toBe(false)
})
