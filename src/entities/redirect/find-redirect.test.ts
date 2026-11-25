import { describe, expect, test } from 'vitest'

import { findRedirect } from './find-redirect'
import { FIXED_REDIRECT_RULES, type RedirectRule } from './redirect-rule'

describe('finding a redirect', () => {
  test('an old project address moves to Lavori with its slug', () => {
    expect(findRedirect('/projects/bussola', FIXED_REDIRECT_RULES)).toEqual({
      pathname: '/lavori/bussola',
      statusCode: 301,
    })
  })

  test.each(['/projects', '/projects/bussola/extra', '/lavori/bussola', '/'])(
    '%s matches no rule',
    (pathname) => {
      expect(findRedirect(pathname, FIXED_REDIRECT_RULES)).toBeUndefined()
    },
  )

  test('the first matching rule wins', () => {
    const rules: RedirectRule[] = [
      { from: '/old/:slug', to: '/new/:slug', statusCode: 308 },
      { from: '/old/:slug', to: '/other/:slug', statusCode: 301 },
    ]
    expect(findRedirect('/old/a/', rules)).toEqual({
      pathname: '/new/a',
      statusCode: 308,
    })
  })
})
