import {
  type DefinedTheme,
  defineTheme,
  generateThemeCSS,
} from '@astryxdesign/core/theme'
import type { FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'

/** Published theme and motion params, as Convex validated them on publish. */
export type Appearance = FunctionReturnType<typeof api.appearance.getPublished>

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

/** Each `base` token matching `name` whose value is a plain length, times `factor`. */
function scaleLengthTokens(
  base: DefinedTheme,
  name: RegExp,
  factor: number,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(base.tokens).flatMap(([token, value]) => {
      const match = typeof value === 'string' ? LENGTH.exec(value) : null
      if (
        !name.test(token) ||
        match?.[1] === undefined ||
        match[2] === undefined
      ) {
        return []
      }
      const unit = match[2]
      const amount = Number(match[1]) * factor
      // Whole milliseconds and pixels; rem to four decimals.
      const rounded =
        unit === 'rem'
          ? Math.round(amount * REM_PRECISION) / REM_PRECISION
          : Math.round(amount)
      return [[token, `${String(rounded)}${unit}`]]
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
      const value = base.tokens[`--text-heading-${String(level)}-weight`]
      const weight =
        typeof value === 'string'
          ? WEIGHT_TOKEN_VALUE.exec(value)?.[1]
          : undefined
      return isFontWeight(weight) ? [[level, weight]] : []
    }),
  )
}
