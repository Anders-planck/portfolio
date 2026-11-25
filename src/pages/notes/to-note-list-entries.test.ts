import { expect, test } from 'vitest'

import { NOTE_CARD } from '../../entities/note/note.fixture'
import { countNotesByTopic, toNoteListEntries } from './to-note-list-entries'

test('each note is listed in the reader’s translation or its fallback', () => {
  expect(toNoteListEntries([NOTE_CARD], 'de')).toMatchObject([
    { slug: 'review-agenti', topic: 'ai', readingMinutes: 7 },
  ])
})

test('a note with no translation a reader can fall back to is left out', () => {
  const frenchOnly = {
    ...NOTE_CARD,
    translations: NOTE_CARD.translations.map((translation) => ({
      ...translation,
      locale: 'fr' as const,
    })),
  }

  expect(toNoteListEntries([frenchOnly], 'de')).toEqual([])
})

test('topics are counted over the listed notes only', () => {
  const entries = toNoteListEntries(
    [NOTE_CARD, NOTE_CARD, { ...NOTE_CARD, topic: 'mobile' }],
    'it',
  )

  expect([...countNotesByTopic(entries)]).toEqual([
    ['ai', 2],
    ['mobile', 1],
  ])
})
