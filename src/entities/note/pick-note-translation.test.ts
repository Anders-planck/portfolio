import { expect, test } from 'vitest'

import { pickNoteTranslation } from './pick-note-translation'

test('a note shows its own translation, else English, else Italian', () => {
  const italian = { locale: 'it' as const, title: 'Ciao' }
  const english = { locale: 'en' as const, title: 'Hello' }

  expect(pickNoteTranslation([italian, english], 'it')).toEqual({
    kind: 'requested',
    locale: 'it',
    content: italian,
  })
  expect(pickNoteTranslation([italian, english], 'de')).toMatchObject({
    kind: 'fallback',
    locale: 'en',
  })
  expect(pickNoteTranslation([], 'de')).toEqual({ kind: 'missing' })
})
