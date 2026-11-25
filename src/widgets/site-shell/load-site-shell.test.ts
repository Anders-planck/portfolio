import { QueryClient } from '@tanstack/react-query'
import { expect, test, vi } from 'vitest'

import { profileQueryOptions } from '../../entities/profile/profile-query-options'
import { loadSiteShell } from './load-site-shell'

// The appearance and the origin come from the Worker; here they just load.
vi.mock('../../entities/appearance/load-appearance', () => ({
  loadAppearance: () => Promise.resolve(),
}))
vi.mock('./site-origin-query-options', () => ({
  siteOriginQueryOptions: () => ({
    queryKey: ['site-origin'],
    queryFn: () => ({
      canonicalOrigin: 'https://example.test',
      isIndexable: false,
    }),
  }),
}))

test('a Profile that cannot be read leaves the footer without contacts, not the page down', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: () => Promise.reject(new Error('Convex unreachable')),
      },
    },
  })

  await expect(loadSiteShell(queryClient, '/en/lavori')).resolves.toEqual({
    locale: 'en',
    siteOrigin: { canonicalOrigin: 'https://example.test', isIndexable: false },
  })
  expect(
    queryClient.getQueryState(profileQueryOptions('en').queryKey)?.status,
  ).toBe('error')
})
