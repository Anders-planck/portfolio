import { type Infer, v } from 'convex/values'

/**
 * Theme and motion params: the part of the site's look the owner tunes in the
 * CMS (Tema). Shared by the Convex functions and the site, which turns them
 * into Astryx CSS at request time (ADR 0010). Pure: no Convex runtime imports.
 */

export const colorModeValidator = v.union(
  v.literal('light'),
  v.literal('dark'),
  v.literal('system'),
)

export const themeParamsValidator = v.object({
  /** Body text size in px; the type scale grows from it. */
  base: v.number(),
  /** Ratio between two steps of the type scale. */
  ratio: v.number(),
  /** Font family names (no fallbacks: the site appends them). */
  fonts: v.object({
    body: v.string(),
    heading: v.string(),
    code: v.string(),
  }),
  /** Multiplies every corner radius of the theme; 0 is square. */
  radiusMultiplier: v.number(),
  mode: colorModeValidator,
})

export const motionCharacterValidator = v.union(
  v.literal('crisp'),
  v.literal('standard'),
  v.literal('expressive'),
)

export const motionParamsValidator = v.object({
  /** Multiplies every motion duration of the theme. */
  tempo: v.number(),
  character: motionCharacterValidator,
})

export const appearanceValidator = v.object({
  theme: themeParamsValidator,
  motion: motionParamsValidator,
})

export type ColorMode = Infer<typeof colorModeValidator>
export type ThemeParams = Infer<typeof themeParamsValidator>
export type MotionParams = Infer<typeof motionParamsValidator>
export type Appearance = Infer<typeof appearanceValidator>

/** What the site renders before anything is published (resolution 11). */
export const defaultAppearance: Appearance = {
  theme: {
    base: 16,
    ratio: 1.25,
    fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
    radiusMultiplier: 1,
    mode: 'system',
  },
  motion: { tempo: 1, character: 'standard' },
}

/** Ranges every stored param must fall in. Astryx clamps tempo to the same. */
export const limits = {
  base: { min: 12, max: 24 },
  ratio: { min: 1.05, max: 1.6 },
  radiusMultiplier: { min: 0, max: 3 },
  tempo: { min: 0.75, max: 1.5 },
} as const

/**
 * A font family name the site may write into CSS: words of letters, digits
 * and hyphens separated by single spaces. Anything else (quotes, commas,
 * semicolons, braces) could break out of the declaration.
 */
const FONT_NAME = /^[A-Za-z][A-Za-z0-9-]*( [A-Za-z0-9][A-Za-z0-9-]*)*$/

export function isSafeFontName(name: string): boolean {
  return name.length <= 64 && FONT_NAME.test(name)
}

/** Every reason `appearance` cannot be published; empty when it can. */
export function appearanceProblems(appearance: Appearance): string[] {
  const problems: string[] = []
  const inRange = (
    field: string,
    value: number,
    range: { min: number; max: number },
  ) => {
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      problems.push(`${field} must be between ${range.min} and ${range.max}`)
    }
  }
  inRange('theme.base', appearance.theme.base, limits.base)
  inRange('theme.ratio', appearance.theme.ratio, limits.ratio)
  inRange(
    'theme.radiusMultiplier',
    appearance.theme.radiusMultiplier,
    limits.radiusMultiplier,
  )
  inRange('motion.tempo', appearance.motion.tempo, limits.tempo)
  for (const [role, name] of Object.entries(appearance.theme.fonts)) {
    if (!isSafeFontName(name)) {
      problems.push(`theme.fonts.${role} is not a font family name`)
    }
  }
  return problems
}
