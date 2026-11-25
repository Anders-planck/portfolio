import { isRedirect } from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import { applyRedirectRules } from './apply-redirect-rules'
import { FIXED_REDIRECT_RULES } from './redirect-rule'

describe('applying the rules before a page loads', () => {
  test('a match throws the router redirect, query string kept', () => {
    let thrown: unknown
    try {
      applyRedirectRules(
        { pathname: '/projects/bussola', searchStr: '?ref=cv' },
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

  test('no match lets the page load', () => {
    expect(() => {
      applyRedirectRules(
        { pathname: '/lavori', searchStr: '' },
        FIXED_REDIRECT_RULES,
      )
    }).not.toThrow()
  })
})
