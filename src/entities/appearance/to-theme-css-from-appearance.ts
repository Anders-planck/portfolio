import {
  type DefinedTheme,
  defineTheme,
  generateThemeCSS,
} from '@astryxdesign/core/theme'

import type { Appearance } from './appearance'

/**
 * The CSS that restyles `base` with the published params (ADR 0010), through
 * Astryx's own generators. Pure and deterministic.
 *
 * The base theme's built stylesheet stays linked; this CSS goes after it in
 * the same `astryx-theme` layer and the same `@scope`, so it wins by order.
 */
export function toThemeCssFromAppearance(
  base: DefinedTheme,
  appearance: Appearance,
): string {
  const { component } = generateThemeCSS(
    toThemeFromAppearance(base, appearance),
  )
  return `@layer astryx-theme {\n${component}\n}`
}

const SANS_FALLBACKS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const MONO_FALLBACKS =
  '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

function toThemeFromAppearance(
  base: DefinedTheme,
  { theme, motion }: Appearance,
): DefinedTheme {
  return defineTheme({
    extends: base,
    name: base.name,
    typography: {
      scale: { base: theme.basePx, ratio: theme.ratio },
      body: { family: theme.fonts.body, fallbacks: SANS_FALLBACKS },
      heading: {
        family: theme.fonts.heading,
        fallbacks: SANS_FALLBACKS,
        // Replacing the heading role drops the base theme's heading weights,
        // and the params own sizes, not weights: carry them over.
        weights: readHeadingWeights(base),
      },
      code: { family: theme.fonts.code, fallbacks: MONO_FALLBACKS },
    },
    motion: { tempo: motion.tempo, character: motion.character },
    tokens: {
      // The base theme sets its own durations and radii, which beat Astryx's
      // tempo knob and radius scale; so scale the theme's own values instead.
      ...scaleLengthTokens(base, DURATION_TOKEN, motion.tempo),
      ...scaleLengthTokens(base, RADIUS_TOKEN, theme.radiusMultiplier),
    },
  })
}

const DURATION_TOKEN = /^--duration-/
/** Every radius but `none` and `full`, which no multiplier changes. */
const RADIUS_TOKEN = /^--radius-(?!none$|full$)/
const LENGTH = /^(-?\d*\.?\d+)(ms|px|rem)$/
const REM_PRECISION = 10_000

interface Length {
  amount: number
  unit: string
}

/** `value` as a plain length (`125ms`, `0.75rem`, `28px`), or undefined. */
function readLength(value: string): Length | undefined {
  const [, amount, unit] = LENGTH.exec(value) ?? []
  if (amount === undefined || unit === undefined) {
    return undefined
  }
  return { amount: Number(amount), unit }
}

/** Whole milliseconds and pixels; rem to four decimals. */
function formatLength({ amount, unit }: Length): string {
  const rounded =
    unit === 'rem'
      ? Math.round(amount * REM_PRECISION) / REM_PRECISION
      : Math.round(amount)
  return `${String(rounded)}${unit}`
}

/** Each `base` token matching `tokenPattern` whose value is a plain length, times `factor`. */
function scaleLengthTokens(
  base: DefinedTheme,
  tokenPattern: RegExp,
  factor: number,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(base.tokens).flatMap(([token, value]) => {
      const length = tokenPattern.test(token) ? readLength(value) : undefined
      if (length === undefined) {
        return []
      }
      return [
        [
          token,
          formatLength({ amount: length.amount * factor, unit: length.unit }),
        ],
      ]
    }),
  )
}

type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const HEADING_LEVELS: readonly HeadingLevel[] = [1, 2, 3, 4, 5, 6]
const FONT_WEIGHTS: readonly string[] = ['normal', 'medium', 'semibold', 'bold']
const WEIGHT_TOKEN_VALUE = /^var\(--font-weight-([a-z]+)\)$/

function isFontWeight(name: string | undefined): name is FontWeight {
  return name !== undefined && FONT_WEIGHTS.includes(name)
}

/** Each heading level's weight in `base`, read from its built tokens. */
function readHeadingWeights(
  base: DefinedTheme,
): Partial<Record<HeadingLevel, FontWeight>> {
  return Object.fromEntries(
    HEADING_LEVELS.flatMap((level) => {
      const value = base.tokens[`--text-heading-${String(level)}-weight`] ?? ''
      const weight = WEIGHT_TOKEN_VALUE.exec(value)?.[1]
      return isFontWeight(weight) ? [[level, weight]] : []
    }),
  )
}
