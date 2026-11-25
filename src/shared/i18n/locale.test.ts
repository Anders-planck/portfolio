import { describe, expect, test } from 'vitest'

import {
  isLocale,
  isPrefixedLocale,
  toHrefInLocale,
  toLocaleFromPathname,
  toPathnameInLocale,
  toUnprefixedPathname,
} from './locale'

describe('locale of an address', () => {
  test.each([
    ['/', 'it'],
    ['/lavori/bussola', 'it'],
    ['/en', 'en'],
    ['/fr/lavori', 'fr'],
    ['/de/note/una-nota', 'de'],
    // A slug that starts like a locale is not a prefix.
    ['/english', 'it'],
  ])('%s is in %s', (pathname, locale) => {
    expect(toLocaleFromPathname(pathname)).toBe(locale)
  })

  test('only en, fr and de live under a prefix', () => {
    expect(['it', 'en', 'fr', 'de', 'es'].filter(isPrefixedLocale)).toEqual([
      'en',
      'fr',
      'de',
    ])
    expect(isLocale('it')).toBe(true)
    expect(isLocale('es')).toBe(false)
  })
})

describe('the same page in another locale', () => {
  test.each([
    ['/', 'en', '/en'],
    ['/en', 'it', '/'],
    ['/en/lavori', 'fr', '/fr/lavori'],
    ['/lavori/bussola', 'de', '/de/lavori/bussola'],
    ['/de/percorso', 'it', '/percorso'],
  ] as const)('%s in %s is %s', (pathname, locale, expected) => {
    expect(toPathnameInLocale(pathname, locale)).toBe(expected)
  })

  test('the unprefixed path drops only a locale prefix', () => {
    expect(toUnprefixedPathname('/en/lavori')).toBe('/lavori')
    expect(toUnprefixedPathname('/fr')).toBe('/')
    expect(toUnprefixedPathname('/english/lavori')).toBe('/english/lavori')
  })

  test('the full address keeps the query string and the anchor', () => {
    expect(
      toHrefInLocale(
        { pathname: '/en/lavori', searchStr: '?vista=lista', hash: 'capitolo' },
        'it',
      ),
    ).toBe('/lavori?vista=lista#capitolo')
    expect(
      toHrefInLocale({ pathname: '/', searchStr: '', hash: '' }, 'de'),
    ).toBe('/de')
  })
})
