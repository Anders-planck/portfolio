import { expect, test, vi } from 'vitest'

import { toPageHead } from './to-page-head'

// The origin is the request's on the server and the window's in the browser.
vi.mock('./read-site-origin', () => ({
  readSiteOrigin: () => 'https://example.test',
}))

test('a page head takes its copy in the locale of its path', () => {
  const { meta, links } = toPageHead('/de', ({ site }) => ({
    title: site.name,
    description: site.description,
  }))
  expect(meta).toEqual(
    expect.arrayContaining([
      { title: 'Anders Planck' },
      {
        name: 'description',
        content: 'Frontend und Full-Stack in TypeScript.',
      },
      { property: 'og:site_name', content: 'Anders Planck' },
    ]),
  )
  expect(links).toContainEqual({
    rel: 'canonical',
    href: 'https://example.test/de',
  })
})
