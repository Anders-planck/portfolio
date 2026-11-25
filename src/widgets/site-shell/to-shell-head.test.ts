import { notFound } from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import { hasNotFoundMatch, toShellHead } from './to-shell-head'

describe('the 404 page', () => {
  test.each([
    ['a route said not found', [{ status: 'notFound' }]],
    [
      'the root shows a thrown not-found',
      [{ status: 'success', error: notFound() }],
    ],
    ['nothing matched the address', [{ status: 'success', _notFound: true }]],
  ])('shows when %s', (_case, matches) => {
    expect(hasNotFoundMatch(matches)).toBe(true)
  })

  test('does not show on a page that loaded', () => {
    expect(
      hasNotFoundMatch([{ status: 'success' }, { status: 'success' }]),
    ).toBe(false)
  })

  test('gets its title in the locale of the address, out of search results', () => {
    expect(toShellHead([{ status: 'notFound' }], 'de').meta).toEqual(
      expect.arrayContaining([
        { title: 'Seite nicht gefunden · Anders Planck' },
        { name: 'robots', content: 'noindex' },
      ]),
    )
  })
})

test('a page that loaded gets only the shared meta from the shell', () => {
  expect(toShellHead([{ status: 'success' }], 'it').meta).toEqual([
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ])
})
