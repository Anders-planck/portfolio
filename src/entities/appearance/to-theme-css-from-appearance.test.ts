import { expect, test } from 'vitest'

import { defaultThemeSlug, themes } from '../../astryx-themes'
import { createAppearance } from './appearance.fixture'
import { toThemeCssFromAppearance } from './to-theme-css-from-appearance'

const BASE_THEME = themes[defaultThemeSlug]

function renderCss(change: Parameters<typeof createAppearance>[0]): string {
  return toThemeCssFromAppearance(BASE_THEME, createAppearance(change))
}

/** Every value `css` declares for `token`, in order. */
function readTokenValues(css: string, token: string): string[] {
  return [...css.matchAll(new RegExp(`\\s${token}: ([^;]+);`, 'g'))].flatMap(
    ([, value]) => (value === undefined ? [] : [value]),
  )
}

function readTokenValue(css: string, token: string): string | undefined {
  return readTokenValues(css, token)[0]
}

test('the CSS sits in the astryx-theme layer, scoped to the theme', () => {
  const css = renderCss({})
  expect(css.startsWith('@layer astryx-theme {')).toBe(true)
  expect(css).toContain('@scope ([data-astryx-theme="portfolio"])')
})

test('the type scale grows from basePx with ratio', () => {
  const css = renderCss({ theme: { basePx: 20, ratio: 1.5 } })
  expect(readTokenValue(css, '--_scaled-font-size-base')).toMatch(
    /^min\(calc\(1\.25rem \*/,
  )
  expect(readTokenValue(css, '--_scaled-font-size-lg')).toMatch(
    /^min\(calc\(1\.875rem \*/,
  )
})

test('a new type scale keeps the base theme heading weights everywhere', () => {
  const weights = readTokenValues(
    renderCss({ theme: { basePx: 20, ratio: 1.5 } }),
    '--text-heading-3-weight',
  )
  // The root and the touch adaptation both declare it.
  expect(weights.length).toBeGreaterThan(1)
  expect(new Set(weights)).toEqual(
    new Set([BASE_THEME.tokens['--text-heading-3-weight']]),
  )
})

test('fonts set the family tokens, with fallbacks', () => {
  const css = renderCss({
    theme: {
      fonts: { body: 'IBM Plex Sans', heading: 'Georgia', code: 'Menlo' },
    },
  })
  expect(readTokenValue(css, '--font-family-body')).toMatch(
    /^"IBM Plex Sans", /,
  )
  expect(readTokenValue(css, '--font-family-heading')).toMatch(/^Georgia, /)
  expect(readTokenValue(css, '--font-family-code')).toMatch(/^Menlo, /)
})

test('the radius multiplier scales the theme radii but not none or full', () => {
  const doubled = renderCss({ theme: { radiusMultiplier: 2 } })
  expect(readTokenValue(renderCss({}), '--radius-element')).toBe('0.625rem')
  expect(readTokenValue(doubled, '--radius-element')).toBe('1.25rem')
  expect(readTokenValue(doubled, '--radius-none')).toBe('0px')
  expect(readTokenValue(doubled, '--radius-full')).toBe('9999px')
})

test('tempo scales the theme durations and reaches the springs', () => {
  const css = renderCss({ motion: { tempo: 1.5 } })
  expect(readTokenValue(css, '--duration-fast')).toBe('188ms')
  expect(readTokenValue(css, '--duration-medium')).toBe('450ms')
  expect(readTokenValue(css, '--_astryx-motion-tempo')).toBe('1.5')
})

test('character changes the entrance curve', () => {
  const expressive = readTokenValue(
    renderCss({ motion: { character: 'expressive' } }),
    '--ease-entrance',
  )
  expect(expressive).toBeDefined()
  expect(expressive).not.toBe(readTokenValue(renderCss({}), '--ease-entrance'))
})

test('the same params always give the same CSS', () => {
  expect(renderCss({ theme: { basePx: 18 } })).toBe(
    renderCss({ theme: { basePx: 18 } }),
  )
})
