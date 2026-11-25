import { expect, test } from 'vitest'

import { pickTranslation } from './pick-translation'

test('the requested locale wins when it has a translation', () => {
  expect(pickTranslation({ it: 'ciao', fr: 'salut' }, 'fr')).toEqual({
    kind: 'requested',
    locale: 'fr',
    content: 'salut',
  })
})

test('a missing translation falls back to English first', () => {
  expect(pickTranslation({ it: 'ciao', en: 'hello' }, 'de')).toEqual({
    kind: 'fallback',
    locale: 'en',
    content: 'hello',
  })
})

test('without English it falls back to the Italian source', () => {
  expect(pickTranslation({ it: 'ciao' }, 'fr')).toEqual({
    kind: 'fallback',
    locale: 'it',
    content: 'ciao',
  })
})

test('with no translation at all it says so', () => {
  expect(pickTranslation<string>({}, 'en')).toEqual({ kind: 'missing' })
})
