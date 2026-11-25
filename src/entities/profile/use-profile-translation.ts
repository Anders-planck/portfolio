import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'

import type { Locale } from '../../shared/i18n/locale'
import {
  type PickedTranslation,
  pickTranslation,
  toFallbackLocales,
} from '../../shared/i18n/pick-translation'
import {
  profileQueryOptions,
  type PublishedProfile,
  toPublishedProfile,
} from './profile-query-options'

/** A Profile with its copy in one locale. */
export interface TranslatedProfile {
  fields: PublishedProfile['fields']
  content: NonNullable<PublishedProfile['content']>
}

/** The published translations, keyed by locale; untranslated ones left out. */
function toTranslationsFromProfiles(
  profiles: readonly (readonly [Locale, PublishedProfile | null])[],
): Partial<Record<Locale, TranslatedProfile>> {
  return profiles.reduce<Partial<Record<Locale, TranslatedProfile>>>(
    (translations, [locale, profile]) =>
      profile?.content == null
        ? translations
        : {
            ...translations,
            [locale]: { fields: profile.fields, content: profile.content },
          },
    {},
  )
}

/**
 * The Profile a page shows in `locale`: its own translation, or the first
 * fallback with one (the page then shows `TranslationFallbackNotice`).
 * `loadProfile` fills the queries first, so this never waits.
 */
export function useProfileTranslation(
  locale: Locale,
): PickedTranslation<TranslatedProfile> {
  const requested = toPublishedProfile(
    useSuspenseQuery(profileQueryOptions(locale)).data,
  )
  const fallbackLocales =
    requested?.content == null ? toFallbackLocales(locale) : []
  const fallbacks = useSuspenseQueries({
    queries: fallbackLocales.map(profileQueryOptions),
  })
  const translations = toTranslationsFromProfiles([
    [locale, requested],
    ...fallbackLocales.map(
      (fallbackLocale, index) =>
        [fallbackLocale, toPublishedProfile(fallbacks[index]?.data)] as const,
    ),
  ])
  return pickTranslation(translations, locale)
}
