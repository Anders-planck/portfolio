// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { publishedCvQueryOptions } from '../../entities/media/published-cv-query-options'
import { PUBLISHED_PROFILE } from '../../entities/profile/profile.fixture'
import { profileQueryOptions } from '../../entities/profile/profile-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteFooter } from './site-footer'

afterEach(cleanup)

const CV_URL = 'https://media.example.com/media/cv/cv-anders-planck.pdf'

/** The footer at `path`, with the Profile query as the shell loader leaves it. */
function renderFooterAt(
  path: string,
  profile: typeof PUBLISHED_PROFILE | null,
) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(profileQueryOptions('fr').queryKey, profile)
  const cv = { url: CV_URL, fileName: 'cv-anders-planck.pdf' }
  queryClient.setQueryData(publishedCvQueryOptions().queryKey, cv)
  return renderAtPath(<SiteFooter />, path, queryClient)
}

test('the footer links home, every section and the Profile contacts', async () => {
  renderFooterAt('/fr', PUBLISHED_PROFILE)
  expect(await screen.findByRole('contentinfo')).toBeDefined()
  expect(
    screen
      .getAllByRole('link')
      .map((link) => [link.textContent, link.getAttribute('href')]),
  ).toEqual([
    ['anders/planck', '/fr'],
    ['Projets', '/fr/lavori'],
    ['Notes', '/fr/note'],
    ['Parcours', '/fr/percorso'],
    ['CV · PDF', CV_URL],
    ['anders@example.com', 'mailto:anders@example.com'],
    ['GitHub', 'https://github.com/Anders-planck'],
  ])
})

test('a Profile that cannot be read leaves the footer without contacts', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: () => Promise.reject(new Error('Convex unreachable')),
      },
    },
  })
  renderAtPath(<SiteFooter />, '/fr', queryClient)
  expect(await screen.findByRole('contentinfo')).toBeDefined()
  expect(screen.getByRole('link', { name: 'anders/planck' })).toBeDefined()
  expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
})

test('before a Profile is published the footer has no contacts', async () => {
  renderFooterAt('/fr', null)
  expect(await screen.findByRole('contentinfo')).toBeDefined()
  expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
})
