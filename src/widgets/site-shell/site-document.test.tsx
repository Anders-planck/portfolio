// @vitest-environment happy-dom
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test, vi } from 'vitest'

import { createAppearance } from '../../entities/appearance/appearance.fixture'
import { SiteDocument } from './site-document'

vi.mock('../../entities/appearance/use-appearance', () => ({
  useAppearance: () => ({
    appearance: createAppearance({ theme: { mode: 'dark' } }),
    css: undefined,
  }),
}))

// The shell has its own test; here only the document around it matters.
vi.mock('./site-shell', () => ({
  SiteShell: ({ children }: { children: ReactNode }) => (
    <section data-site-shell="">{children}</section>
  ),
}))

/** The server HTML of a page at `path`, as the Worker would send it. */
async function renderDocumentAt(path: string): Promise<string> {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <SiteDocument>
          <p>Pagina</p>
        </SiteDocument>
      ),
    }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  return renderToString(<RouterProvider router={router} />)
}

// The inline appearance CSS is checked on the real Worker (appearance.spec).
test('the document carries the locale of the address and the published mode', async () => {
  const html = await renderDocumentAt('/fr/lavori')
  expect(html).toMatch(/<html lang="fr"[^>]*data-theme="dark"/)
  expect(html).toContain('<p>Pagina</p>')
})

test('site pages get the site shell; the CMS gets the document without it', async () => {
  expect(await renderDocumentAt('/')).toContain('data-site-shell')

  const cmsHtml = await renderDocumentAt('/cms/profilo')
  expect(cmsHtml).not.toContain('data-site-shell')
  expect(cmsHtml).toContain('<p>Pagina</p>')
})
