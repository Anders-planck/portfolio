import { isNotFound, isRedirect } from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import {
  guardLocaleSegment,
  redirectFromDefaultLocalePrefix,
} from './guard-locale-segment'

/** What a guard threw, or undefined when it let the address through. */
function catchThrown(guard: () => void): unknown {
  try {
    guard()
    return undefined
  } catch (thrown) {
    return thrown
  }
}

describe('the locale segment', () => {
  test.each([undefined, 'en', 'fr', 'de'])('%s passes', (segment) => {
    expect(
      catchThrown(() => {
        guardLocaleSegment(segment)
      }),
    ).toBeUndefined()
  })

  test.each(['lavori', 'es', 'it'])(
    '%s is a page that does not exist',
    (segment) => {
      expect(
        isNotFound(
          catchThrown(() => {
            guardLocaleSegment(segment)
          }),
        ),
      ).toBe(true)
    },
  )
})

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
