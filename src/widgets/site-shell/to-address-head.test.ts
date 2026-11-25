import { expect, test } from 'vitest'

import { toAddressHead } from './to-address-head'

const PRODUCTION = {
  canonicalOrigin: 'https://example.test',
  isIndexable: true,
}

test('a page names itself canonical in its own locale', () => {
  const { links } = toAddressHead({
    siteOrigin: PRODUCTION,
    pathname: '/fr/lavori',
  })
  expect(links).toContainEqual({
    rel: 'canonical',
    href: 'https://example.test/fr/lavori',
  })
})

test('every locale gets an hreflang link, and x-default is the Italian page', () => {
  const { links } = toAddressHead({
    siteOrigin: PRODUCTION,
    pathname: '/fr/lavori',
  })
  expect(
    links
      .filter((link) => link.rel === 'alternate')
      .map((link) => [link.hrefLang, link.href]),
  ).toEqual([
    ['it', 'https://example.test/lavori'],
    ['en', 'https://example.test/en/lavori'],
    ['fr', 'https://example.test/fr/lavori'],
    ['de', 'https://example.test/de/lavori'],
    ['x-default', 'https://example.test/lavori'],
  ])
})

test('on the production host Open Graph has the URL and locale, and indexing is allowed', () => {
  const { meta } = toAddressHead({ siteOrigin: PRODUCTION, pathname: '/' })
  expect(meta).toEqual([
    { property: 'og:url', content: 'https://example.test/' },
    { property: 'og:locale', content: 'it_IT' },
  ])
})

test('off the production host the page is kept out of search results', () => {
  const { meta, links } = toAddressHead({
    siteOrigin: { canonicalOrigin: 'https://example.test', isIndexable: false },
    pathname: '/de',
  })
  expect(meta).toContainEqual({ name: 'robots', content: 'noindex' })
  expect(links).toContainEqual({
    rel: 'canonical',
    href: 'https://example.test/de',
  })
})
