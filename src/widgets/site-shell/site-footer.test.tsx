// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { PUBLISHED_PROFILE } from '../../entities/profile/profile.fixture'
import { profileQueryOptions } from '../../entities/profile/profile-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteFooter } from './site-footer'

afterEach(cleanup)

/** The footer at `path`, with the Profile query as the shell loader leaves it. */
function renderFooterAt(
  path: string,
  profile: typeof PUBLISHED_PROFILE | null,
) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(profileQueryOptions('fr').queryKey, profile)
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
    ['CV · PDF', '/fr/cv'],
    ['anders@example.com', 'mailto:anders@example.com'],
    ['GitHub', 'https://github.com/Anders-planck'],
  ])
})

test('before a Profile is published the footer has no contacts', async () => {
  renderFooterAt('/fr', null)
  expect(await screen.findByRole('contentinfo')).toBeDefined()
  expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
})
