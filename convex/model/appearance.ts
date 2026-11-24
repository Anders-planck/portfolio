import { type Infer, v } from 'convex/values'

/**
 * Appearance: the published theme and motion params (ADR 0010). Pure domain
 * rules for the Convex functions: validators, defaults and the publish checks.
 * The site turns validated params into Astryx CSS (src/entities/appearance).
 */

export const colorModeValidator = v.union(
  v.literal('light'),
  v.literal('dark'),
  v.literal('system'),
)

export const themeParamsValidator = v.object({
  /** Body text size in px; the type scale grows from it. */
  basePx: v.number(),
  /** Ratio between two steps of the type scale. */
  ratio: v.number(),
  /** Font family names, without fallbacks: the site appends them. */
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

export type Appearance = Infer<typeof appearanceValidator>

/** What the site renders before anything is published (resolution 11). */
export const DEFAULT_APPEARANCE: Appearance = {
  theme: {
    basePx: 16,
    ratio: 1.25,
    fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
    radiusMultiplier: 1,
    mode: 'system',
  },
  motion: { tempo: 1, character: 'standard' },
}

interface Range {
  min: number
  max: number
}

/** Ranges every published number must fall in; Astryx clamps tempo to the same. */
const RANGES = {
  basePx: { min: 12, max: 24 },
  ratio: { min: 1.05, max: 1.6 },
  radiusMultiplier: { min: 0, max: 3 },
  tempo: { min: 0.75, max: 1.5 },
} as const satisfies Record<string, Range>

/**
 * A font family name the site may write into CSS: words of letters, digits
 * and hyphens separated by single spaces. Quotes, commas, semicolons or braces
 * could break out of the declaration, so they never pass.
 */
const FONT_NAME = /^[A-Za-z][A-Za-z0-9-]*( [A-Za-z0-9][A-Za-z0-9-]*)*$/
const FONT_NAME_MAX_LENGTH = 64
/** CSS-wide keywords: as a family they would not name a font at all. */
const CSS_WIDE_KEYWORDS: readonly string[] = [
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
  'default',
]

function isFontName(name: string): boolean {
  return (
    name.length <= FONT_NAME_MAX_LENGTH &&
    FONT_NAME.test(name) &&
    !CSS_WIDE_KEYWORDS.includes(name.toLowerCase())
  )
}

function isInRange(value: number, range: Range): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max
}

export const appearanceProblemValidator = v.union(
  v.object({
    kind: v.literal('out-of-range'),
    field: v.union(
      v.literal('theme.basePx'),
      v.literal('theme.ratio'),
      v.literal('theme.radiusMultiplier'),
      v.literal('motion.tempo'),
    ),
    min: v.number(),
    max: v.number(),
  }),
  v.object({
    kind: v.literal('not-a-font-name'),
    field: v.union(
      v.literal('theme.fonts.body'),
      v.literal('theme.fonts.heading'),
      v.literal('theme.fonts.code'),
    ),
  }),
)

/** Why params cannot be published; the CMS words it from its messages. */
export type AppearanceProblem = Infer<typeof appearanceProblemValidator>

/** Every reason `appearance` cannot be published; empty when it can. */
export function findAppearanceProblems({
  theme,
  motion,
}: Appearance): AppearanceProblem[] {
  const numbers = [
    { field: 'theme.basePx', value: theme.basePx, range: RANGES.basePx },
    { field: 'theme.ratio', value: theme.ratio, range: RANGES.ratio },
    {
      field: 'theme.radiusMultiplier',
      value: theme.radiusMultiplier,
      range: RANGES.radiusMultiplier,
    },
    { field: 'motion.tempo', value: motion.tempo, range: RANGES.tempo },
  ] as const
  const fonts = [
    { field: 'theme.fonts.body', name: theme.fonts.body },
    { field: 'theme.fonts.heading', name: theme.fonts.heading },
    { field: 'theme.fonts.code', name: theme.fonts.code },
  ] as const
  return [
    ...numbers
      .filter(({ value, range }) => !isInRange(value, range))
      .map(({ field, range }) => ({
        kind: 'out-of-range' as const,
        field,
        min: range.min,
        max: range.max,
      })),
    ...fonts
      .filter(({ name }) => !isFontName(name))
      .map(({ field }) => ({ kind: 'not-a-font-name' as const, field })),
  ]
}

/**
 * What the site is served for the stored params: them if they keep every
 * rule, else the defaults. The table takes any string its validator allows
 * and only `publish` checks the rules, so a row written another way
 * (dashboard, import, migration) is checked again before it reaches the CSS.
 */
export function toServedAppearanceFromStored(
  stored: Appearance | null,
): Appearance {
  if (stored === null || findAppearanceProblems(stored).length > 0) {
    return DEFAULT_APPEARANCE
  }
  return stored
}
