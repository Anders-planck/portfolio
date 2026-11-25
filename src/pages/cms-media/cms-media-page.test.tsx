// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SCREENSHOT_ENTRY } from '../../entities/media/media.fixture'
import { mediaLibraryQueryOptions } from '../../entities/media/media-library-query-options'
import { CmsMediaPage } from './cms-media-page'

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(),
  useMutation: () => vi.fn(),
}))

afterEach(cleanup)

function renderPage(seed: (queryClient: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: () => Promise.reject(new Error('Convex unreachable')),
      },
    },
  })
  seed(queryClient)
  render(
    <QueryClientProvider client={queryClient}>
      <CmsMediaPage />
    </QueryClientProvider>,
  )
}

test('Media shows the library the owner reads', () => {
  renderPage((queryClient) => {
    queryClient.setQueryData(mediaLibraryQueryOptions().queryKey, {
      isStorageConfigured: true,
      hasImageVariants: true,
      media: [SCREENSHOT_ENTRY],
    })
  })

  expect(screen.getByRole('heading', { level: 1, name: 'Media' })).toBeDefined()
  expect(screen.getByText('bussola-chat.png')).toBeDefined()
})

test('a library that cannot be read says so', async () => {
  renderPage(() => undefined)

  expect(await screen.findByText('Non riesco a leggere i media')).toBeDefined()
})
