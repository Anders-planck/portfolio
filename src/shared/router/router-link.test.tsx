// @vitest-environment happy-dom
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, test } from 'vitest'

import { RouterLink } from './router-link'

/** Renders `ui` as the page at `path` inside a real router. */
function renderAtPath(ui: ReactNode, path: string) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(<RouterProvider router={router} />)
  return { router }
}

afterEach(cleanup)

test('a site address moves through the router', async () => {
  const { router } = renderAtPath(
    <RouterLink href="/en/lavori">Work</RouterLink>,
    '/en',
  )
  const link = await screen.findByRole('link', { name: 'Work' })
  expect(link.getAttribute('href')).toBe('/en/lavori')
  fireEvent.click(link)
  await waitFor(() => {
    expect(router.state.location.pathname).toBe('/en/lavori')
  })
})

test('an external address stays a plain link with its target', async () => {
  renderAtPath(
    <RouterLink href="https://github.com/Anders-planck" target="_blank">
      GitHub
    </RouterLink>,
    '/',
  )
  const link = await screen.findByRole('link', { name: 'GitHub' })
  expect(link.getAttribute('href')).toBe('https://github.com/Anders-planck')
  expect(link.getAttribute('target')).toBe('_blank')
})
