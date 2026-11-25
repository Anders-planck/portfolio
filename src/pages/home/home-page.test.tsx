// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { PUBLISHED_PROFILE } from '../../entities/profile/profile.fixture'
import {
  profileQueryOptions,
  type PublishedProfile,
} from '../../entities/profile/profile-query-options'
import { type Locale, LOCALES } from '../../shared/i18n/locale'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { HomePage } from './home-page'

afterEach(cleanup)

/** Renders Home at `path` as the loader leaves it: the queries resolved. */
function renderHomeAt(
  path: string,
  profiles: Partial<Record<Locale, PublishedProfile | null>>,
) {
  const queryClient = new QueryClient()
  LOCALES.filter((locale) => locale in profiles).forEach((locale) => {
    queryClient.setQueryData(
      profileQueryOptions(locale).queryKey,
      profiles[locale] ?? null,
    )
  })
  return renderAtPath(<HomePage />, path, queryClient)
}

test('Home shows the published profile copy and contact links', async () => {
  renderHomeAt('/', { it: PUBLISHED_PROFILE })

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Software Engineer.',
    }),
  ).toBeDefined()
  expect(screen.getByText('Frontend e full-stack in TypeScript.')).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Scrivimi' }).getAttribute('href'),
  ).toBe('mailto:anders@example.com')
  expect(
    screen.getByRole('link', { name: 'GitHub' }).getAttribute('href'),
  ).toBe('https://github.com/Anders-planck')
  expect(screen.queryByText(/non è ancora tradotta/)).toBeNull()
})

test('an untranslated locale shows the Italian profile with a notice in its own words', async () => {
  renderHomeAt('/fr', {
    fr: { ...PUBLISHED_PROFILE, locale: 'fr', content: null },
    en: { ...PUBLISHED_PROFILE, locale: 'en', content: null },
    it: PUBLISHED_PROFILE,
  })

  expect(
    await screen.findByText(
      'Cette page n’est pas encore traduite : vous la lisez en Italiano.',
    ),
  ).toBeDefined()
  expect(
    screen.getByRole('heading', { level: 1, name: 'Software Engineer.' }),
  ).toBeDefined()
})

test('Home stays empty when nothing is published in any locale', async () => {
  const { router } = renderHomeAt('/en', { en: null, it: null })

  await router.load()
  expect(screen.queryByRole('heading')).toBeNull()
})
