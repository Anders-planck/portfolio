import { expect, test } from 'vitest'

import { toDraftEditFromNoteEdit } from './note-draft'

test('a note edit becomes the saveDraft arguments of that note and locale', () => {
  expect(
    toDraftEditFromNoteEdit(
      'note-a',
      { fields: { slug: 'nota' }, content: { title: 'Titolo' } },
      'fr',
    ),
  ).toEqual({
    key: 'note-a',
    fields: { slug: 'nota' },
    localeEdit: { locale: 'fr', content: { title: 'Titolo' } },
  })
  expect(
    toDraftEditFromNoteEdit('note-a', { fields: { topic: 'ai' } }, 'it'),
  ).toEqual({
    key: 'note-a',
    fields: { topic: 'ai' },
  })
})
