// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { AUTOSAVE_DELAY_MS } from '../../entities/draft/use-draft-autosave'
import { useNoteAutosave } from './use-note-autosave'

const saveDraft = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => saveDraft }))

beforeEach(() => {
  vi.useFakeTimers()
  saveDraft.mockReset()
  saveDraft.mockResolvedValue({ savedAt: 1, revision: 2 })
})
afterEach(() => {
  vi.useRealTimers()
})

test('edits of a note are merged and saved to that note and locale', async () => {
  const { result } = renderHook(() => useNoteAutosave('note-a', 'en', 0))

  act(() => {
    result.current.queueEdit({ content: { title: 'Title' } })
    result.current.queueEdit({ fields: { topic: 'mobile' } })
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
  })

  expect(saveDraft).toHaveBeenCalledExactlyOnceWith({
    key: 'note-a',
    fields: { topic: 'mobile' },
    localeEdit: { locale: 'en', content: { title: 'Title' } },
  })
})
