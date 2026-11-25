// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { createAppearance } from '../../entities/appearance/appearance.fixture'
import { profileQueryOptions } from '../../entities/profile/profile-query-options'
import { astryxCatalogQueryOptions } from '../../shared/i18n/astryx-catalog-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteShell } from './site-shell'

// The published params come live from Convex; the defaults are enough here.
vi.mock('../../entities/appearance/use-appearance', () => ({
  useAppearance: () => ({ appearance: createAppearance(), css: undefined }),
}))

afterEach(cleanup)

test('every page sits between the one header and the footer', async () => {
  const queryClient = new QueryClient()
  await queryClient.query(astryxCatalogQueryOptions('en'))
  queryClient.setQueryData(profileQueryOptions('en').queryKey, null)
  renderAtPath(
    <QueryClientProvider client={queryClient}>
      <SiteShell>
        <h1>Page</h1>
      </SiteShell>
    </QueryClientProvider>,
    '/en',
  )
  const main = await screen.findByRole('main')
  expect(main.textContent).toContain('Page')
  expect(screen.getByRole('banner').textContent).toContain('anders/planck')
  expect(screen.getByRole('contentinfo').textContent).toContain('Work')
})
