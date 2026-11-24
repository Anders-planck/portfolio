import { describe, expect, test } from 'vitest'
import { portfolioTheme } from '../../themes/portfolio/portfolio.theme'
import { type Appearance, defaultAppearance } from './appearance'
import { appearanceCss } from './appearanceCss'

function withParams(change: {
  theme?: Partial<Appearance['theme']>
  motion?: Partial<Appearance['motion']>
}): Appearance {
  return {
    theme: { ...defaultAppearance.theme, ...change.theme },
    motion: { ...defaultAppearance.motion, ...change.motion },
  }
}

/** The value of the first declaration of `token` in `css`. */
function tokenValue(css: string, token: string) {
  const match = new RegExp(`\\s${token}: ([^;]+);`).exec(css)
  return match?.[1]
}

describe('appearanceCss', () => {
  test('wraps the scoped theme CSS in the astryx-theme layer', () => {
    const css = appearanceCss(portfolioTheme, defaultAppearance)
    expect(css.startsWith('@layer astryx-theme {')).toBe(true)
    expect(css).toContain('@scope ([data-astryx-theme="portfolio"])')
  })

  test('the type scale grows from base with ratio', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({ theme: { base: 20, ratio: 1.5 } }),
    )
    expect(tokenValue(css, '--_scaled-font-size-base')).toMatch(
      /^min\(calc\(1\.25rem \*/,
    )
    expect(tokenValue(css, '--_scaled-font-size-lg')).toMatch(
      /^min\(calc\(1\.875rem \*/,
    )
  })

  test('keeps what the base theme sets and the params do not', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({ theme: { base: 20, ratio: 1.5 } }),
    )
    const weights = [...css.matchAll(/--text-heading-3-weight: ([^;]+);/g)]
    // The root and the touch adaptation both keep the base weight.
    expect(weights.length).toBeGreaterThan(1)
    for (const [, weight] of weights) {
      expect(weight).toBe(portfolioTheme.tokens?.['--text-heading-3-weight'])
    }
    expect(tokenValue(css, '--color-background-surface')).toBeDefined()
  })

  test('fonts set the family tokens with fallbacks', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({
        theme: {
          fonts: { body: 'IBM Plex Sans', heading: 'Georgia', code: 'Menlo' },
        },
      }),
    )
    expect(tokenValue(css, '--font-family-body')).toMatch(/^"IBM Plex Sans", /)
    expect(tokenValue(css, '--font-family-heading')).toMatch(/^Georgia, /)
    expect(tokenValue(css, '--font-family-code')).toMatch(/^Menlo, /)
  })

  test('a font name that could break out of CSS falls back', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({
        theme: {
          fonts: {
            body: 'x;}</style><script>',
            heading: 'Figtree',
            code: 'ui-monospace',
          },
        },
      }),
    )
    expect(css).not.toContain('</style>')
    expect(tokenValue(css, '--font-family-body')).toMatch(/^Figtree, /)
  })

  test('the radius multiplier scales the theme radii, not none or full', () => {
    const base = appearanceCss(portfolioTheme, defaultAppearance)
    const doubled = appearanceCss(
      portfolioTheme,
      withParams({ theme: { radiusMultiplier: 2 } }),
    )
    expect(tokenValue(base, '--radius-element')).toBe('0.625rem')
    expect(tokenValue(doubled, '--radius-element')).toBe('1.25rem')
    expect(tokenValue(doubled, '--radius-none')).toBe('0px')
    expect(tokenValue(doubled, '--radius-full')).toBe('9999px')
  })

  test('tempo scales the theme durations and reaches the springs', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({ motion: { tempo: 1.5 } }),
    )
    expect(tokenValue(css, '--duration-fast')).toBe('188ms')
    expect(tokenValue(css, '--duration-medium')).toBe('450ms')
    expect(tokenValue(css, '--_astryx-motion-tempo')).toBe('1.5')
  })

  test('tempo is clamped to the Astryx range', () => {
    const css = appearanceCss(
      portfolioTheme,
      withParams({ motion: { tempo: 9 } }),
    )
    expect(tokenValue(css, '--_astryx-motion-tempo')).toBe('1.5')
  })

  test('character changes the entrance curve', () => {
    const standard = appearanceCss(portfolioTheme, defaultAppearance)
    const expressive = appearanceCss(
      portfolioTheme,
      withParams({ motion: { character: 'expressive' } }),
    )
    expect(tokenValue(expressive, '--ease-entrance')).toBeDefined()
    expect(tokenValue(expressive, '--ease-entrance')).not.toBe(
      tokenValue(standard, '--ease-entrance'),
    )
  })

  test('is deterministic, as a Convex query must be', () => {
    const params = withParams({ theme: { base: 18 } })
    expect(appearanceCss(portfolioTheme, params)).toBe(
      appearanceCss(portfolioTheme, structuredClone(params)),
    )
  })
})
