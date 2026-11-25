// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { AUTOSAVE_DELAY_MS, useProfileAutosave } from './use-profile-autosave'

// The hook's one dependency on Convex: each test decides how saving goes.
const saveDraft = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => saveDraft }))

const SAVED_AT = 1_700_000_000_000

beforeEach(() => {
  vi.useFakeTimers()
  saveDraft.mockReset()
  saveDraft.mockResolvedValue({ savedAt: SAVED_AT, revision: 2 })
})
afterEach(() => {
  vi.useRealTimers()
})

function renderAutosave() {
  return renderHook(() => useProfileAutosave('it', null))
}

async function waitForAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
  })
}

describe('useProfileAutosave', () => {
  test('edits typed together are saved once, after a pause', async () => {
    const { result } = renderAutosave()

    act(() => {
      result.current.queueEdit({ content: { subtitle: 'Fr' } })
      result.current.queueEdit({ content: { subtitle: 'Frontend' } })
      result.current.queueEdit({ fields: { name: 'Anders' } })
    })
    expect(result.current.saveState).toEqual({ kind: 'unsaved' })
    expect(saveDraft).not.toHaveBeenCalled()

    await waitForAutosave()

    expect(saveDraft).toHaveBeenCalledOnce()
    expect(saveDraft).toHaveBeenCalledWith({
      collection: 'profile',
      key: 'main',
      fields: { name: 'Anders' },
      localeEdit: { locale: 'it', content: { subtitle: 'Frontend' } },
    })
    expect(result.current.saveState).toEqual({
      kind: 'saved',
      savedAt: SAVED_AT,
    })
  })

  test('a failed save keeps the edit, and retry saves it with later ones', async () => {
    saveDraft.mockRejectedValueOnce(new Error('network'))
    const { result } = renderAutosave()

    act(() => {
      result.current.queueEdit({ content: { subtitle: 'Persa?' } })
    })
    await waitForAutosave()
    expect(result.current.saveState).toEqual({ kind: 'failed' })

    act(() => {
      result.current.queueEdit({ content: { titleLine1: 'Software' } })
    })
    await waitForAutosave()

    expect(saveDraft).toHaveBeenLastCalledWith({
      collection: 'profile',
      key: 'main',
      localeEdit: {
        locale: 'it',
        content: { subtitle: 'Persa?', titleLine1: 'Software' },
      },
    })
    expect(result.current.saveState.kind).toBe('saved')
  })

  test('an edit typed while a save runs waits for the next save', async () => {
    let finishFirstSave = (_saved: { savedAt: number; revision: number }) => {}
    saveDraft.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirstSave = resolve
        }),
    )
    const { result } = renderAutosave()

    act(() => {
      result.current.queueEdit({ content: { subtitle: 'Uno' } })
    })
    await waitForAutosave()
    act(() => {
      result.current.queueEdit({ content: { subtitle: 'Due' } })
    })
    await waitForAutosave()
    expect(saveDraft).toHaveBeenCalledOnce()

    await act(async () => {
      finishFirstSave({ savedAt: SAVED_AT, revision: 1 })
      await vi.runAllTimersAsync()
    })

    expect(saveDraft).toHaveBeenCalledTimes(2)
    expect(saveDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        localeEdit: { locale: 'it', content: { subtitle: 'Due' } },
      }),
    )
  })

  test('leaving the screen saves what is still waiting', () => {
    const { result, unmount } = renderAutosave()

    act(() => {
      result.current.queueEdit({ content: { subtitle: 'Ultima' } })
    })
    unmount()

    expect(saveDraft).toHaveBeenCalledOnce()
  })
})
