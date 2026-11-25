import { isRedirect } from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import { redirectFromDefaultLocalePrefix } from './redirect-from-default-locale-prefix'

/** What a guard threw, or undefined when it let the address through. */
function catchThrown(guard: () => void): unknown {
  try {
    guard()
    return undefined
  } catch (thrown) {
    return thrown
  }
}

describe('the Italian prefix', () => {
  test.each([
    ['/it', '', '/'],
    ['/it/lavori', '?vista=lista', '/lavori?vista=lista'],
  ])(
    '%s moves for good to the address without it',
    (pathname, searchStr, href) => {
      const thrown = catchThrown(() => {
        redirectFromDefaultLocalePrefix({ pathname, searchStr })
      })
      expect(isRedirect(thrown)).toBe(true)
      expect(thrown).toMatchObject({
        status: 301,
        options: { href },
      })
    },
  )

  test('other addresses load as they are', () => {
    expect(
      catchThrown(() => {
        redirectFromDefaultLocalePrefix({ pathname: '/italia', searchStr: '' })
      }),
    ).toBeUndefined()
  })
})
