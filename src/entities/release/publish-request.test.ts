import { describe, expect, test } from 'vitest'

import { toPublishRequest } from './publish-request'

const createRequestId = () => 'new-id'

describe('toPublishRequest', () => {
  test('a first publish gets a new request id', () => {
    expect(toPublishRequest(null, 4, createRequestId)).toEqual({
      revision: 4,
      requestId: 'new-id',
    })
  })

  test('a retry after a lost answer reuses the unconfirmed request', () => {
    const unconfirmed = { revision: 4, requestId: 'first-id' }

    expect(toPublishRequest(unconfirmed, 4, createRequestId)).toBe(unconfirmed)
  })

  test('a newer revision is a new request', () => {
    expect(
      toPublishRequest(
        { revision: 4, requestId: 'first-id' },
        5,
        createRequestId,
      ),
    ).toEqual({ revision: 5, requestId: 'new-id' })
  })
})
