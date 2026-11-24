import { expect, test } from 'vitest'

import {
  type Appearance,
  DEFAULT_APPEARANCE,
  findAppearanceProblems,
} from './appearance'

function withTheme(theme: Partial<Appearance['theme']>): Appearance {
  return {
    ...DEFAULT_APPEARANCE,
    theme: { ...DEFAULT_APPEARANCE.theme, ...theme },
  }
}

test('the defaults can be published', () => {
  expect(findAppearanceProblems(DEFAULT_APPEARANCE)).toEqual([])
})

test('the range limits are inclusive', () => {
  expect(
    findAppearanceProblems({
      theme: { ...DEFAULT_APPEARANCE.theme, basePx: 24, radiusMultiplier: 0 },
      motion: { tempo: 0.75, character: 'crisp' },
    }),
  ).toEqual([])
})

test('every number out of range is reported with its field', () => {
  expect(
    findAppearanceProblems({
      theme: {
        ...DEFAULT_APPEARANCE.theme,
        basePx: 11,
        ratio: Number.NaN,
        radiusMultiplier: 4,
      },
      motion: { tempo: 2, character: 'standard' },
    }),
  ).toEqual([
    'theme.basePx must be between 12 and 24',
    'theme.ratio must be between 1.05 and 1.6',
    'theme.radiusMultiplier must be between 0 and 3',
    'motion.tempo must be between 0.75 and 1.5',
  ])
})

test('font names with multiple words or hyphens pass', () => {
  expect(
    findAppearanceProblems(
      withTheme({
        fonts: {
          body: 'IBM Plex Sans',
          heading: 'Noto Serif',
          code: 'ui-monospace',
        },
      }),
    ),
  ).toEqual([])
})

test('a font name that could break out of CSS is reported', () => {
  expect(
    findAppearanceProblems(
      withTheme({
        fonts: { body: 'Inter"', heading: 'a, serif', code: 'x}</style>' },
      }),
    ),
  ).toEqual([
    'theme.fonts.body is not a font family name',
    'theme.fonts.heading is not a font family name',
    'theme.fonts.code is not a font family name',
  ])
})
