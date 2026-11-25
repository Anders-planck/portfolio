import type { QueryClient } from '@tanstack/react-query'

import type { Locale } from '../../shared/i18n/locale'
import { toFallbackLocales } from '../../shared/i18n/pick-translation'
import { profileQueryOptions } from './profile-query-options'

function queryProfile(queryClient: QueryClient, locale: Locale) {
  return queryClient.query({
    ...profileQueryOptions(locale),
    staleTime: 'static',
  })
}

/**
 * For a loader: the published Profile in `locale` and, only when that
 * locale has no translation, in the locales it falls back to. Awaited on
 * the server, so the first paint has what `useProfileTranslation` reads.
 */
export async function loadProfile(
  queryClient: QueryClient,
  locale: Locale,
): Promise<void> {
  const requested = await queryProfile(queryClient, locale)
  if (requested?.content != null) {
    return
  }
  await Promise.all(
    toFallbackLocales(locale).map((fallbackLocale) =>
      queryProfile(queryClient, fallbackLocale),
    ),
  )
}
