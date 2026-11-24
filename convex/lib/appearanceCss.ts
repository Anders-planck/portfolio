import {
  type DefinedTheme,
  defineTheme,
  generateThemeCSS,
} from '@astryxdesign/core/theme'
import { type Appearance, isSafeFontName, limits } from './appearance'

/**
 * Turns published theme and motion params into the CSS that restyles a built
 * Astryx theme (ADR 0010). Pure and deterministic. It runs inside a Convex
 * query, so it runs once per publish (Convex caches query results), never in
 * the browser and never per request.
 *
 * The base theme's built stylesheet stays linked; this CSS goes after it in
 * the same `astryx-theme` layer and the same `@scope`, so it wins by order.
 */
export function appearanceCss(base: DefinedTheme, appearance: Appearance) {
  const { component } = generateThemeCSS(appearanceTheme(base, appearance))
  return `@layer astryx-theme {\n${component}\n}`
}

const SANS_FALLBACKS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const MONO_FALLBACKS =
  '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

/** The base theme with the params applied, through Astryx's own generators. */
function appearanceTheme(base: DefinedTheme, { theme, motion }: Appearance) {
  const tempo = clamp(motion.tempo, limits.tempo)
  return defineTheme({
    extends: base,
    name: base.name,
    typography: {
      scale: {
        base: clamp(theme.base, limits.base),
        ratio: clamp(theme.ratio, limits.ratio),
      },
      body: {
        family: font(theme.fonts.body, 'Figtree'),
        fallbacks: SANS_FALLBACKS,
      },
      heading: {
        family: font(theme.fonts.heading, 'Figtree'),
        fallbacks: SANS_FALLBACKS,
        // Replacing the heading role drops the base theme's heading weights,
        // and the params own sizes, not weights: carry them over.
        weights: headingWeights(base),
      },
      code: {
        family: font(theme.fonts.code, 'ui-monospace'),
        fallbacks: MONO_FALLBACKS,
      },
    },
    motion: { tempo, character: motion.character },
    tokens: {
      // The base theme sets its own durations and radii, which beat Astryx's
      // tempo knob and radius scale; so scale the theme's own values instead.
      ...scaleTokens(base, /^--duration-/, tempo, 'ms'),
      ...scaleTokens(
        base,
        /^--radius-(?!none$|full$)/,
        clamp(theme.radiusMultiplier, limits.radiusMultiplier),
      ),
    },
  })
}

type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold'
const FONT_WEIGHTS: readonly string[] = ['normal', 'medium', 'semibold', 'bold']

/** Each heading level's weight in `base`, read from its built tokens. */
function headingWeights(base: DefinedTheme) {
  const weights: Partial<Record<1 | 2 | 3 | 4 | 5 | 6, FontWeight>> = {}
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    const value = base.tokens?.[`--text-heading-${level}-weight`]
    const name = /^var\(--font-weight-([a-z]+)\)$/.exec(String(value))?.[1]
    if (name !== undefined && FONT_WEIGHTS.includes(name)) {
      weights[level] = name as FontWeight
    }
  }
  return weights
}

/** Each matching plain length token of `base` multiplied by `factor`. */
function scaleTokens(
  base: DefinedTheme,
  name: RegExp,
  factor: number,
  onlyUnit?: string,
) {
  const scaled: Record<string, string> = {}
  for (const [token, value] of Object.entries(base.tokens ?? {})) {
    if (!name.test(token) || typeof value !== 'string') {
      continue
    }
    const match = /^(-?\d*\.?\d+)(ms|px|rem)$/.exec(value)
    if (match === null || (onlyUnit && match[2] !== onlyUnit)) {
      continue
    }
    const unit = match[2]
    const amount = Number(match[1]) * factor
    // Whole milliseconds and pixels; rem to four decimals.
    const rounded =
      unit === 'rem' ? Math.round(amount * 10_000) / 10_000 : Math.round(amount)
    scaled[token] = `${rounded}${unit}`
  }
  return scaled
}

function font(name: string, fallback: string) {
  return isSafeFontName(name) ? name : fallback
}

function clamp(value: number, range: { min: number; max: number }) {
  if (!Number.isFinite(value)) {
    return range.min
  }
  return Math.min(range.max, Math.max(range.min, value))
}
