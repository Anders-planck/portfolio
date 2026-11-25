import { expect, test } from 'vitest'

import { checkPublishLimits, MAX_NOTE_LENGTH, MAX_SELECTION } from './limits'

const MAIN = { collection: 'profile', key: 'main' } as const
const OTHER = { collection: 'profile', key: 'other' } as const

test('a request with distinct documents and a short note passes', () => {
  expect(() => {
    checkPublishLimits({ selection: [MAIN, OTHER], note: 'Rilascio' })
  }).not.toThrow()
})

test('an empty selection is refused', () => {
  expect(() => {
    checkPublishLimits({ selection: [], note: '' })
  }).toThrow(/at least one/)
})

test('a selection over the limit is refused', () => {
  const selection = Array.from({ length: MAX_SELECTION + 1 }, (_, index) => ({
    collection: 'profile' as const,
    key: `doc-${String(index)}`,
  }))

  expect(() => {
    checkPublishLimits({ selection, note: '' })
  }).toThrow(/at most/)
})

test('a document named twice is refused', () => {
  expect(() => {
    checkPublishLimits({ selection: [MAIN, OTHER, MAIN], note: '' })
  }).toThrow(/profile\/main is selected more than once/)
})

test('a note over the limit is refused', () => {
  expect(() => {
    checkPublishLimits({
      selection: [MAIN],
      note: 'x'.repeat(MAX_NOTE_LENGTH + 1),
    })
  }).toThrow(/note/)
})
