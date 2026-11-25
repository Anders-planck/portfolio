import { useCallback, useEffect, useRef, useState } from 'react'

/** Typing pauses this long before an edit is saved. */
export const AUTOSAVE_DELAY_MS = 800

/**
 * Where the owner's edits are (resolution 14: saving is automatic). `saved`
 * carries the time of the last save, null if the draft was never saved.
 */
export type SaveState =
  | { kind: 'saved'; savedAt: number | null }
  | { kind: 'unsaved' }
  | { kind: 'saving' }
  | { kind: 'failed' }

export interface DraftAutosaveOptions<Edit> {
  /** Saves one merged edit; keep it stable (useCallback) between renders. */
  saveEdit: (edit: Edit) => Promise<{ savedAt: number }>
  /** Folds a newer edit into the one still waiting. */
  mergeEdits: (pending: Edit | null, next: Edit) => Edit
  lastSavedAt: number | null
}

/**
 * Saves a draft's edits a moment after the owner stops typing, one save at
 * a time; edits made during a save wait for the next one. A failed save
 * keeps its edit and is retried by `retry` or by the next edit. Every CMS
 * editor saves through it, with its own `saveEdit`.
 */
export function useDraftAutosave<Edit>({
  saveEdit,
  mergeEdits,
  lastSavedAt,
}: DraftAutosaveOptions<Edit>) {
  const [saveState, setSaveState] = useState<SaveState>({
    kind: 'saved',
    savedAt: lastSavedAt,
  })
  const pendingEdit = useRef<Edit | null>(null)
  const isSaving = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveNow = useCallback(async () => {
    clearTimer(timer)
    const edit = pendingEdit.current
    if (isSaving.current || edit === null) {
      return
    }
    pendingEdit.current = null
    isSaving.current = true
    setSaveState({ kind: 'saving' })
    try {
      const { savedAt } = await saveEdit(edit)
      isSaving.current = false
      // Edits typed while this save ran are waiting in the ref.
      if (readPendingEdit(pendingEdit) === null) {
        setSaveState({ kind: 'saved', savedAt })
        return
      }
      setSaveState({ kind: 'unsaved' })
      await saveNow()
    } catch {
      isSaving.current = false
      const waiting = readPendingEdit(pendingEdit)
      pendingEdit.current = waiting === null ? edit : mergeEdits(edit, waiting)
      setSaveState({ kind: 'failed' })
    }
  }, [saveEdit, mergeEdits])

  const queueEdit = useCallback(
    (edit: Edit) => {
      pendingEdit.current = mergeEdits(pendingEdit.current, edit)
      if (!isSaving.current) {
        setSaveState({ kind: 'unsaved' })
      }
      clearTimer(timer)
      timer.current = setTimeout(() => {
        void saveNow()
      }, AUTOSAVE_DELAY_MS)
    },
    [saveNow, mergeEdits],
  )

  // Leaving the screen saves what is still waiting.
  useEffect(
    () => () => {
      void saveNow()
    },
    [saveNow],
  )

  return {
    saveState,
    queueEdit,
    retry: () => {
      void saveNow()
    },
  }
}

// A function, so the type checker does not keep the narrowing it made
// before the `await`: the ref can change while a save runs.
function readPendingEdit<Edit>(pendingEdit: { current: Edit | null }) {
  return pendingEdit.current
}

function clearTimer(timer: { current: ReturnType<typeof setTimeout> | null }) {
  if (timer.current !== null) {
    clearTimeout(timer.current)
    timer.current = null
  }
}
