import { ConvexError } from 'convex/values'
import { describe, expect, test } from 'vitest'

import { toAccessProblemFromFlowError } from './to-access-problem-from-flow-error'

describe('toAccessProblemFromFlowError', () => {
  test('no flow error is no problem', () => {
    expect(toAccessProblemFromFlowError(null)).toBeNull()
  })

  test('an account refused by the allowlist is not the owner', () => {
    expect(
      toAccessProblemFromFlowError({
        error: 'OTHER_ERROR',
        cause: new ConvexError({ kind: 'not-owner' }),
      }),
    ).toBe('not-owner')
  })

  test('cancelling at GitHub and an expired flow have their own problem', () => {
    expect(toAccessProblemFromFlowError({ error: 'ACCESS_DENIED' })).toBe(
      'cancelled',
    )
    expect(toAccessProblemFromFlowError({ error: 'EXPIRED' })).toBe('expired')
  })

  test('any other failure is a failed sign-in', () => {
    expect(toAccessProblemFromFlowError({ error: 'INVALID_FLOW' })).toBe(
      'failed',
    )
    expect(
      toAccessProblemFromFlowError({
        error: 'OTHER_ERROR',
        cause: new Error('network'),
      }),
    ).toBe('failed')
    expect(
      toAccessProblemFromFlowError({
        error: 'OTHER_ERROR',
        cause: new ConvexError({ kind: 'something-else' }),
      }),
    ).toBe('failed')
  })
})
