import { expect, test } from 'vitest'

import { isSameAppearance, toHtmlDataThemeFromMode } from './appearance'
import { createAppearance } from './appearance.fixture'

test('the same params in another key order are the same appearance', () => {
  const appearance = createAppearance()
  const reordered = {
    motion: {
      character: appearance.motion.character,
      tempo: appearance.motion.tempo,
    },
    theme: { ...appearance.theme },
  }
  expect(isSameAppearance(appearance, reordered)).toBe(true)
})

test('one changed param makes another appearance', () => {
  expect(
    isSameAppearance(
      createAppearance(),
      createAppearance({ motion: { tempo: 1.2 } }),
    ),
  ).toBe(false)
  expect(
    isSameAppearance(
      createAppearance(),
      createAppearance({
        theme: {
          fonts: { body: 'Inter', heading: 'Figtree', code: 'ui-monospace' },
        },
      }),
    ),
  ).toBe(false)
})

test('light and dark force the html theme; system leaves it to the reader', () => {
  expect(toHtmlDataThemeFromMode('light')).toBe('light')
  expect(toHtmlDataThemeFromMode('dark')).toBe('dark')
  expect(toHtmlDataThemeFromMode('system')).toBeUndefined()
})
