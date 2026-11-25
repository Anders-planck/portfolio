import { expect, test } from 'vitest'

import { toNotFoundHead } from './to-not-found-head'

test.each([
  ['it', 'Pagina non trovata · Anders Planck'],
  ['en', 'Page not found · Anders Planck'],
  ['fr', 'Page introuvable · Anders Planck'],
  ['de', 'Seite nicht gefunden · Anders Planck'],
] as const)(
  'in %s the 404 title is %j, kept out of search results',
  (locale, title) => {
    expect(toNotFoundHead(locale).meta).toEqual([
      { title },
      { name: 'robots', content: 'noindex' },
    ])
  },
)
