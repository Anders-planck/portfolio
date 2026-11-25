import { isRedirect } from '@tanstack/react-router'
import { expect, test } from 'vitest'

import { FIXED_REDIRECT_RULES } from './redirect-rule'
import { redirectToCanonicalAddress } from './redirect-to-canonical-address'

test('an address that moved throws the router redirect, query string kept', () => {
  let thrown: unknown
  try {
    redirectToCanonicalAddress(
      { pathname: '/it/projects/bussola', searchStr: '?ref=cv' },
      FIXED_REDIRECT_RULES,
    )
  } catch (caught) {
    thrown = caught
  }
  expect(isRedirect(thrown)).toBe(true)
  expect(thrown).toMatchObject({
    status: 301,
    options: { href: '/lavori/bussola?ref=cv' },
  })
})

test('a canonical address lets the page load', () => {
  expect(() => {
    redirectToCanonicalAddress(
      { pathname: '/en/lavori', searchStr: '' },
      FIXED_REDIRECT_RULES,
    )
  }).not.toThrow()
})
