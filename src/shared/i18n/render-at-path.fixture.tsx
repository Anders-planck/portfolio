import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Renders `ui` as the page at `path`, inside a real router, so the locale
 * hooks read the address and links navigate, with an empty query client.
 * Returns the router and the client too.
 */
export function renderAtPath(ui: ReactNode, path: string) {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...rendered, router, queryClient }
}
