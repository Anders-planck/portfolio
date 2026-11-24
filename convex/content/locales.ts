import { type Infer, v } from 'convex/values'

/** Site locales. IT is the default (served without a prefix). */
export const vLocale = v.union(
  v.literal('it'),
  v.literal('en'),
  v.literal('fr'),
  v.literal('de'),
)

export type Locale = Infer<typeof vLocale>
