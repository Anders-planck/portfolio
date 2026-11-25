import { expect, test } from 'vitest'

import { toPageHead } from './to-page-head'

test('a page head takes its copy in the locale of its path', () => {
  const { meta } = toPageHead('/de', ({ site }) => ({
    title: site.name,
    description: site.description,
  }))
  expect(meta).toEqual([
    { title: 'Anders Planck' },
    { name: 'description', content: 'Frontend und Full-Stack in TypeScript.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Anders Planck' },
    { property: 'og:title', content: 'Anders Planck' },
    {
      property: 'og:description',
      content: 'Frontend und Full-Stack in TypeScript.',
    },
  ])
})

test('a page outside the public content asks search engines not to index it', () => {
  const { meta } = toPageHead(
    '/',
    ({ site }) => ({ title: site.name, description: site.description }),
    { isListed: false },
  )
  expect(meta).toContainEqual({ name: 'robots', content: 'noindex' })
})
