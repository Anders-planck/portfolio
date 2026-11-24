import type { Appearance } from './appearance'

/**
 * The site's default appearance (the same values as Convex's
 * DEFAULT_APPEARANCE, which src/ may not import), with `change` applied.
 */
export function createAppearance(
  change: {
    theme?: Partial<Appearance['theme']>
    motion?: Partial<Appearance['motion']>
  } = {},
): Appearance {
  return {
    theme: {
      basePx: 16,
      ratio: 1.25,
      fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
      radiusMultiplier: 1,
      mode: 'system',
      ...change.theme,
    },
    motion: { tempo: 1, character: 'standard', ...change.motion },
  }
}
