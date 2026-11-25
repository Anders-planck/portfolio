import { expect, test } from 'vitest'

import { toSeoHead } from './to-seo-head'

const PAGE = {
  origin: 'https://example.test',
  siteName: 'Anders Planck',
  title: 'Projets',
  description: 'Frontend et full-stack en TypeScript.',
}

test('a page names itself canonical in its own locale', () => {
  const { meta, links } = toSeoHead({ ...PAGE, pathname: '/fr/lavori' })
  expect(links).toContainEqual({
    rel: 'canonical',
    href: 'https://example.test/fr/lavori',
  })
  expect(meta).toContainEqual({ title: 'Projets' })
  expect(meta).toContainEqual({
    name: 'description',
    content: 'Frontend et full-stack en TypeScript.',
  })
})

test('every locale gets an hreflang link, and x-default is the Italian page', () => {
  const { links } = toSeoHead({ ...PAGE, pathname: '/fr/lavori' })
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

test('Open Graph repeats the title and description, with locale and URL', () => {
  const { meta } = toSeoHead({ ...PAGE, pathname: '/' })
  expect(meta).toEqual(
    expect.arrayContaining([
      { property: 'og:title', content: 'Projets' },
      { property: 'og:url', content: 'https://example.test/' },
      { property: 'og:locale', content: 'it_IT' },
      { property: 'og:site_name', content: 'Anders Planck' },
    ]),
  )
})
