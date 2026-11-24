import type { FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'

/** Published theme and motion params, as Convex validated them. */
export type Appearance = FunctionReturnType<typeof api.appearance.getPublished>

/** Compares field by field, so the key order of the two objects never matters. */
export function isSameAppearance(left: Appearance, right: Appearance): boolean {
  return toAppearanceKey(left) === toAppearanceKey(right)
}

/** One string per distinct appearance, whatever the key order of the object. */
export function toAppearanceKey({ theme, motion }: Appearance): string {
  return JSON.stringify([
    theme.basePx,
    theme.ratio,
    theme.fonts.body,
    theme.fonts.heading,
    theme.fonts.code,
    theme.radiusMultiplier,
    theme.mode,
    motion.tempo,
    motion.character,
  ])
}
