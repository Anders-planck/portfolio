import { expect, test } from 'vitest'

import { FIXED_REDIRECT_RULES } from './redirect-rule'
import { toCanonicalAddress } from './to-canonical-address'

test.each([
  ['/', undefined],
  ['/lavori', undefined],
  ['/en/lavori/bussola', undefined],
  ['/fr', undefined],
])('%s is already canonical', (pathname, expected) => {
  expect(toCanonicalAddress(pathname, FIXED_REDIRECT_RULES)).toBe(expected)
})

test.each([
  // The Italian prefix goes: IT is served without one.
  ['/it', '/'],
  ['/it/lavori', '/lavori'],
  // One hop, even when the prefix and a rule both apply.
  ['/it/projects/bussola', '/lavori/bussola'],
  // A rule keeps the locale of the address.
  ['/projects/bussola', '/lavori/bussola'],
  ['/en/projects/bussola', '/en/lavori/bussola'],
  ['/de/projects/bussola/', '/de/lavori/bussola'],
  // No trailing slash, except the home page itself.
  ['/lavori/', '/lavori'],
  ['/en/', '/en'],
])('%s moves for good to %s', (pathname, canonicalPathname) => {
  expect(toCanonicalAddress(pathname, FIXED_REDIRECT_RULES)).toEqual({
    pathname: canonicalPathname,
    statusCode: 301,
  })
})

test.each([
  ['/it//evil.com', '/evil.com'],
  ['/it/\\evil.com', '/evil.com'],
  ['/it/%5Cevil.com', '/evil.com'],
  ['//evil.com', '/evil.com'],
  ['/lavori//bussola', '/lavori/bussola'],
])(
  '%s never becomes an address on another site',
  (pathname, canonicalPathname) => {
    expect(toCanonicalAddress(pathname, FIXED_REDIRECT_RULES)).toEqual({
      pathname: canonicalPathname,
      statusCode: 301,
    })
  },
)

test('a rule keeps its own status code', () => {
  expect(
    toCanonicalAddress('/en/old/a', [
      { from: '/old/:slug', to: '/new/:slug', statusCode: 308 },
    ]),
  ).toEqual({ pathname: '/en/new/a', statusCode: 308 })
})
