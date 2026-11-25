// @vitest-environment happy-dom
import { TopNav } from '@astryxdesign/core/TopNav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { astryxCatalogQueryOptions } from './astryx-catalog-query-options'
import { AstryxLocaleProvider } from './astryx-locale-provider'
import type { Locale } from './locale'
import { renderAtPath } from './render-at-path.fixture'

afterEach(cleanup)

/**
 * The name Astryx gives its navigation landmark on a page at `path`, with
 * the catalog filled as the root loader leaves it.
 */
async function readTopNavLabelAt(path: string, locale: Locale) {
  const queryClient = new QueryClient()
  await queryClient.query(astryxCatalogQueryOptions(locale))
  renderAtPath(
    <QueryClientProvider client={queryClient}>
      <AstryxLocaleProvider>
        <TopNav />
      </AstryxLocaleProvider>
    </QueryClientProvider>,
    path,
  )
  const label = (await screen.findByRole('navigation')).getAttribute(
    'aria-label',
  )
  cleanup()
  return label
}

test('Astryx components speak the locale of the page', async () => {
  const englishLabel = await readTopNavLabelAt('/en', 'en')
  const italianLabel = await readTopNavLabelAt('/lavori', 'it')
  expect(englishLabel).toBe('Top navigation')
  expect(italianLabel).not.toBe('')
  expect(italianLabel).not.toBe(englishLabel)
})

test('English needs no catalog: it is built into Astryx', async () => {
  const queryClient = new QueryClient()
  expect(await queryClient.query(astryxCatalogQueryOptions('en'))).toEqual({})
  const italian = await queryClient.query(astryxCatalogQueryOptions('it'))
  expect(Object.keys(italian).length).toBeGreaterThan(0)
})
