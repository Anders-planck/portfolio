import { QueryClient } from '@tanstack/react-query'
import { expect, test, vi } from 'vitest'

import { type Locale, LOCALES } from '../../shared/i18n/locale'
import { loadProfile } from './load-profile'
import { PUBLISHED_PROFILE } from './profile.fixture'
import { profileQueryOptions } from './profile-query-options'

/**
 * A client whose queries answer like Convex would for these translations,
 * and the list of locales it was asked for.
 */
function createClientWith(translatedLocales: readonly Locale[]) {
  const askedLocales: Locale[] = []
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: vi.fn(({ queryKey }) => {
          const locale = LOCALES.find(
            (candidate) =>
              JSON.stringify(queryKey) ===
              JSON.stringify(profileQueryOptions(candidate).queryKey),
          )
          if (locale === undefined) {
            throw new Error('not a profile query')
          }
          askedLocales.push(locale)
          return {
            ...PUBLISHED_PROFILE,
            locale,
            content: translatedLocales.includes(locale)
              ? PUBLISHED_PROFILE.content
              : null,
          }
        }),
      },
    },
  })
  return { queryClient, askedLocales }
}

test('a translated locale loads only itself', async () => {
  const { queryClient, askedLocales } = createClientWith(['it', 'de'])
  await loadProfile(queryClient, 'de')
  expect(askedLocales).toEqual(['de'])
})

test('an untranslated locale also loads the locales it falls back to', async () => {
  const { queryClient, askedLocales } = createClientWith(['it'])
  await loadProfile(queryClient, 'fr')
  expect(askedLocales).toEqual(['fr', 'en', 'it'])
})
