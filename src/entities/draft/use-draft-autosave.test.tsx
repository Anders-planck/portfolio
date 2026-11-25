// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { AUTOSAVE_DELAY_MS, useDraftAutosave } from './use-draft-autosave'

const SAVED_AT = 1_700_000_000_000

/** An edit is a list of words; merging appends. */
type WordsEdit = string[]

const saveEdit = vi.fn<(edit: WordsEdit) => Promise<{ savedAt: number }>>()

function mergeWords(pending: WordsEdit | null, next: WordsEdit): WordsEdit {
  return [...(pending ?? []), ...next]
}

beforeEach(() => {
  vi.useFakeTimers()
  saveEdit.mockReset()
  saveEdit.mockResolvedValue({ savedAt: SAVED_AT })
})
afterEach(() => {
  vi.useRealTimers()
})

function renderAutosave() {
  return renderHook(() =>
    useDraftAutosave({ saveEdit, mergeEdits: mergeWords, lastSavedAt: null }),
  )
}

async function waitForAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
  })
}

test('a draft never saved says so', () => {
  expect(renderAutosave().result.current.saveState).toEqual({
    kind: 'saved',
    savedAt: null,
  })
})

test('edits made together are merged and saved once, after a pause', async () => {
  const { result } = renderAutosave()

  act(() => {
    result.current.queueEdit(['uno'])
    result.current.queueEdit(['due'])
  })
  expect(result.current.saveState).toEqual({ kind: 'unsaved' })
  await waitForAutosave()

  expect(saveEdit).toHaveBeenCalledExactlyOnceWith(['uno', 'due'])
  expect(result.current.saveState).toEqual({ kind: 'saved', savedAt: SAVED_AT })
})

test('a failed save is kept and retried together with the edits after it', async () => {
  saveEdit.mockRejectedValueOnce(new Error('network'))
  const { result } = renderAutosave()

  act(() => {
    result.current.queueEdit(['persa'])
  })
  await waitForAutosave()
  expect(result.current.saveState).toEqual({ kind: 'failed' })

  act(() => {
    result.current.queueEdit(['dopo'])
  })
  await waitForAutosave()

  expect(saveEdit).toHaveBeenLastCalledWith(['persa', 'dopo'])
})

test('retry saves the failed edit at once', async () => {
  saveEdit.mockRejectedValueOnce(new Error('network'))
  const { result } = renderAutosave()
  act(() => {
    result.current.queueEdit(['persa'])
  })
  await waitForAutosave()

  await act(async () => {
    result.current.retry()
    await vi.runAllTimersAsync()
  })

  expect(saveEdit).toHaveBeenCalledTimes(2)
  expect(result.current.saveState.kind).toBe('saved')
})
