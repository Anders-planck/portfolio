import { expect, test } from 'vitest'

import {
  type Appearance,
  DEFAULT_APPEARANCE,
  findAppearanceProblems,
  toServedAppearanceFromStored,
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
    { kind: 'out-of-range', field: 'theme.basePx', min: 12, max: 24 },
    { kind: 'out-of-range', field: 'theme.ratio', min: 1.05, max: 1.6 },
    { kind: 'out-of-range', field: 'theme.radiusMultiplier', min: 0, max: 3 },
    { kind: 'out-of-range', field: 'motion.tempo', min: 0.75, max: 1.5 },
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
    { kind: 'not-a-font-name', field: 'theme.fonts.body' },
    { kind: 'not-a-font-name', field: 'theme.fonts.heading' },
    { kind: 'not-a-font-name', field: 'theme.fonts.code' },
  ])
})

test('a CSS-wide keyword is not a font name, in any case', () => {
  expect(
    findAppearanceProblems(
      withTheme({
        fonts: { body: 'inherit', heading: 'Revert-Layer', code: 'DEFAULT' },
      }),
    ),
  ).toEqual([
    { kind: 'not-a-font-name', field: 'theme.fonts.body' },
    { kind: 'not-a-font-name', field: 'theme.fonts.heading' },
    { kind: 'not-a-font-name', field: 'theme.fonts.code' },
  ])
  for (const keyword of ['initial', 'unset', 'revert']) {
    expect(
      findAppearanceProblems(
        withTheme({
          fonts: { body: keyword, heading: 'Figtree', code: 'ui-monospace' },
        }),
      ),
    ).toEqual([{ kind: 'not-a-font-name', field: 'theme.fonts.body' }])
  }
})

test('nothing stored serves the defaults', () => {
  expect(toServedAppearanceFromStored(null)).toEqual(DEFAULT_APPEARANCE)
})

test('stored params that keep every rule are served as they are', () => {
  const stored = withTheme({ basePx: 18, mode: 'dark' })
  expect(toServedAppearanceFromStored(stored)).toEqual(stored)
})

test('stored params that break a rule serve the defaults', () => {
  expect(
    toServedAppearanceFromStored(
      withTheme({
        fonts: { body: 'x</style>', heading: 'Figtree', code: 'ui-monospace' },
      }),
    ),
  ).toEqual(DEFAULT_APPEARANCE)
  expect(toServedAppearanceFromStored(withTheme({ basePx: 99 }))).toEqual(
    DEFAULT_APPEARANCE,
  )
})
