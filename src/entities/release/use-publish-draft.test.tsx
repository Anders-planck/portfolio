// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'

import { usePublishDraft } from './use-publish-draft'

const publish = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => publish }))

const PUBLISHED = { status: 'published', releaseId: 'r1', findings: [] }

beforeEach(() => {
  publish.mockReset()
  publish.mockResolvedValue(PUBLISHED)
})

function renderPublish() {
  return renderHook(() =>
    usePublishDraft({ collection: 'note', key: 'note-a' }),
  )
}

function readRequestIds() {
  return (publish.mock.calls as [{ requestId: string }][]).map(
    ([request]) => request.requestId,
  )
}

test('a publish whose answer was lost is retried with the same request id', async () => {
  publish.mockRejectedValueOnce(new Error('network'))
  const { result } = renderPublish()

  await act(() => result.current.publishDraft(4))
  expect(result.current.publishState).toEqual({ kind: 'unconfirmed' })
  await act(() => result.current.publishDraft(4))

  const [first, second] = readRequestIds()
  expect(second).toBe(first)
  expect(result.current.publishState).toEqual({
    kind: 'answered',
    outcome: PUBLISHED,
  })
})

test('a newer revision is a new request', async () => {
  publish.mockRejectedValueOnce(new Error('network'))
  const { result } = renderPublish()

  await act(() => result.current.publishDraft(4))
  await act(() => result.current.publishDraft(5))

  const [first, second] = readRequestIds()
  expect(second).not.toBe(first)
  expect(publish).toHaveBeenLastCalledWith(
    expect.objectContaining({
      selection: [{ collection: 'note', key: 'note-a', revision: 5 }],
    }),
  )
})

test('scheduledAt is sent only when a time is given', async () => {
  const { result } = renderPublish()

  await act(() => result.current.publishDraft(4))
  await act(() => result.current.publishDraft(6, 1_900_000_000_000))

  expect(publish.mock.calls[0]?.[0]).not.toHaveProperty('scheduledAt')
  expect(publish).toHaveBeenLastCalledWith(
    expect.objectContaining({ scheduledAt: 1_900_000_000_000 }),
  )
})
