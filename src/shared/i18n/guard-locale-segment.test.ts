import { isNotFound } from '@tanstack/react-router'
import { describe, expect, test } from 'vitest'

import { guardLocaleSegment } from './guard-locale-segment'

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
