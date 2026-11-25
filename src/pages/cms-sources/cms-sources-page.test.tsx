// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import { CmsSourcesPage } from './cms-sources-page'
import { SOURCES_OVERVIEW } from './sources.fixture'

const refreshNow = vi.hoisted(() => vi.fn(() => Promise.resolve(null)))
vi.mock('convex/react', () => ({
  useAction: () => refreshNow,
  useMutation: () => vi.fn(),
}))

afterEach(cleanup)

const OVERVIEW_KEY = convexQueryOptions(
  api.metrics.getSourcesOverview,
  {},
).queryKey

function renderPage(seed: (queryClient: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  seed(queryClient)
  render(
    <QueryClientProvider client={queryClient}>
      <CmsSourcesPage />
    </QueryClientProvider>,
  )
}

test('Fonti shows the overview the owner reads', () => {
  renderPage((queryClient) => {
    queryClient.setQueryData(OVERVIEW_KEY, SOURCES_OVERVIEW)
  })

  expect(
    screen.getByRole('heading', { level: 1, name: 'Fonti dei numeri' }),
  ).toBeDefined()
})

test('"Aggiorna ora" runs the refresh action', async () => {
  renderPage((queryClient) => {
    queryClient.setQueryData(OVERVIEW_KEY, SOURCES_OVERVIEW)
  })

  fireEvent.click(screen.getByRole('button', { name: 'Aggiorna ora' }))

  await waitFor(() => {
    expect(refreshNow).toHaveBeenCalledWith({})
  })
})

test('while the overview loads the page says so', () => {
  renderPage(() => undefined)

  expect(screen.getByRole('status').textContent).toBe(
    'Caricamento delle fonti…',
  )
})
