import { useMutation } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import {
  mergeProfileEdits,
  type ProfileEdit,
  toDraftEditFromProfileEdit,
} from '../../entities/profile/profile-draft'
import type { Locale } from '../../shared/i18n/locale'

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

/**
 * Saves Profile edits in `locale` a moment after the owner stops typing, one
 * save at a time; edits made during a save wait for the next one. A failed
 * save keeps its edit and is retried by `retry` or by the next edit.
 */
export function useProfileAutosave(locale: Locale, lastSavedAt: number | null) {
  const saveDraft = useMutation(api.content.saveDraft)
  const [saveState, setSaveState] = useState<SaveState>({
    kind: 'saved',
    savedAt: lastSavedAt,
  })
  const pendingEdit = useRef<ProfileEdit | null>(null)
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
      const { savedAt } = await saveDraft(
        toDraftEditFromProfileEdit(edit, locale),
      )
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
      pendingEdit.current = mergeProfileEdits(
        edit,
        readPendingEdit(pendingEdit) ?? {},
      )
      setSaveState({ kind: 'failed' })
    }
  }, [locale, saveDraft])

  const queueEdit = useCallback(
    (edit: ProfileEdit) => {
      pendingEdit.current = mergeProfileEdits(pendingEdit.current, edit)
      if (!isSaving.current) {
        setSaveState({ kind: 'unsaved' })
      }
      clearTimer(timer)
      timer.current = setTimeout(() => {
        void saveNow()
      }, AUTOSAVE_DELAY_MS)
    },
    [saveNow],
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
function readPendingEdit(pendingEdit: { current: ProfileEdit | null }) {
  return pendingEdit.current
}

function clearTimer(timer: { current: ReturnType<typeof setTimeout> | null }) {
  if (timer.current !== null) {
    clearTimeout(timer.current)
    timer.current = null
  }
}
