import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import { hasNotFoundMatch, toShellHead } from './to-shell-head'

const PREVIEW = { canonicalOrigin: 'https://example.test', isIndexable: false }

/**
 * The route shapes of src/routes (a root with the 404, the optional locale
 * segment, Home and the catch-all), loaded at `path` by the real router, so
 * a router upgrade that changes how a 404 shows up fails here.
 */
async function loadMatchesAt(path: string) {
  const rootRoute = createRootRoute({ notFoundComponent: () => null })
  const localeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '{-$locale}',
    beforeLoad: ({ params }) => {
      if (params.locale !== undefined && params.locale !== 'en') {
        notFound({ throw: true })
      }
    },
  })
  const homeRoute = createRoute({
    getParentRoute: () => localeRoute,
    path: '/',
  })
  const catchAllRoute = createRoute({
    getParentRoute: () => localeRoute,
    path: '$',
    beforeLoad: () => {
      notFound({ throw: true })
    },
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      localeRoute.addChildren([homeRoute, catchAllRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  return router.state.matches
}

describe('the 404 page', () => {
  test.each(['/en/no-such-page', '/no/such/page', '/xyz'])(
    'shows for %s, read from the router’s public match state',
    async (path) => {
      expect(hasNotFoundMatch(await loadMatchesAt(path))).toBe(true)
    },
  )

  test.each(['/', '/en'])('does not show on %s', async (path) => {
    expect(hasNotFoundMatch(await loadMatchesAt(path))).toBe(false)
  })

  test('gets its title in the locale of the address, out of search results', () => {
    expect(
      toShellHead({
        matches: [{ status: 'notFound', pathname: '/de/x' }],
        shell: { locale: 'de', siteOrigin: PREVIEW },
      }),
    ).toEqual({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Seite nicht gefunden · Anders Planck' },
        { name: 'robots', content: 'noindex' },
      ],
      links: [],
    })
  })
})

test('a page that loaded gets the address head of the deepest match', () => {
  const { meta, links } = toShellHead({
    matches: [
      { status: 'success', pathname: '/' },
      { status: 'success', pathname: '/en' },
    ],
    shell: { locale: 'en', siteOrigin: PREVIEW },
  })
  expect(links).toContainEqual({
    rel: 'canonical',
    href: 'https://example.test/en',
  })
  expect(meta).toContainEqual({ property: 'og:locale', content: 'en_GB' })
})

test('before the root loader answers only the shared meta is known', () => {
  expect(toShellHead({ matches: [], shell: undefined })).toEqual({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [],
  })
})
