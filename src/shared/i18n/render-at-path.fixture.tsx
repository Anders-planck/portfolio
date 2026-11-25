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
 * hooks read the address and links navigate. Returns the router too.
 */
export function renderAtPath(ui: ReactNode, path: string) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  const rendered = render(<RouterProvider router={router} />)
  return { ...rendered, router }
}
