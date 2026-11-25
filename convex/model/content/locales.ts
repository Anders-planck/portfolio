import { type Infer, v } from 'convex/values'

/** Site locales. IT is the default (served without a prefix). */
export const localeValidator = v.union(
  v.literal('it'),
  v.literal('en'),
  v.literal('fr'),
  v.literal('de'),
)

export type Locale = Infer<typeof localeValidator>

/** The same locales as a list, read from the validator so they cannot drift. */
export const LOCALES: readonly Locale[] = localeValidator.members.map(
  (member) => member.value,
)

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value)
}
