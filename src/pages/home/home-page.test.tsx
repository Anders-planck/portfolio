// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import type { FunctionReturnType } from 'convex/server'
import { afterEach, expect, test } from 'vitest'

import type { api } from '../../../convex/_generated/api'
import { HomePage, homeProfileQueryOptions } from './home-page'

afterEach(cleanup)

type PublishedProfile = FunctionReturnType<typeof api.content.getPublished>

const PUBLISHED_PROFILE: PublishedProfile = {
  collection: 'profile',
  key: 'main',
  locale: 'it',
  fields: {
    name: 'Anders Planck',
    email: 'anders@example.com',
    links: [{ label: 'GitHub', href: 'https://github.com/Anders-planck' }],
    isAvailable: true,
    skills: { frontend: '', backend: '', infra: '' },
  },
  content: {
    statusLabel: 'Software Engineer · Ferrara',
    availabilityLabel: 'Disponibile',
    titleLine1: 'Software',
    titleLine2: 'Engineer.',
    subtitle: 'Frontend e full-stack in TypeScript.',
    contactLabel: 'Scrivimi',
    languages: '',
  },
}

/** Renders the page as the loader leaves it: the query already resolved. */
function renderHomeWith(profile: PublishedProfile) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(homeProfileQueryOptions.queryKey, profile)
  return render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  )
}

test('Home shows the published profile copy and contact links', () => {
  renderHomeWith(PUBLISHED_PROFILE)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Software Engineer.' }),
  ).toBeDefined()
  expect(screen.getByText('Frontend e full-stack in TypeScript.')).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Scrivimi' }).getAttribute('href'),
  ).toBe('mailto:anders@example.com')
  expect(
    screen.getByRole('link', { name: 'GitHub' }).getAttribute('href'),
  ).toBe('https://github.com/Anders-planck')
})

test('Home stays empty when the locale has no published content', () => {
  renderHomeWith({ ...PUBLISHED_PROFILE, content: null })

  expect(screen.queryByRole('heading')).toBeNull()
})
