import { type Infer, v } from 'convex/values'

/** Site locales. IT is the default (served without a prefix). */
export const LOCALES = ['it', 'en', 'fr', 'de'] as const

export const localeValidator = v.union(
  v.literal('it'),
  v.literal('en'),
  v.literal('fr'),
  v.literal('de'),
)

export type Locale = Infer<typeof localeValidator>

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value)
}
