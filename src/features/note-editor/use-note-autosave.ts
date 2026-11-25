import { useMutation } from 'convex/react'
import { useCallback } from 'react'

import { api } from '../../../convex/_generated/api'
import { mergeDraftEdits } from '../../entities/draft/merge-draft-edits'
import { useDraftAutosave } from '../../entities/draft/use-draft-autosave'
import {
  type NoteContent,
  type NoteEdit,
  type NoteFields,
  toDraftEditFromNoteEdit,
} from '../../entities/note/note-draft'
import type { Locale } from '../../shared/i18n/locale'

/** Autosaves edits of note `noteKey` in `locale` through `notes.saveDraft`. */
export function useNoteAutosave(
  noteKey: string,
  locale: Locale,
  lastSavedAt: number,
) {
  const saveDraft = useMutation(api.notes.saveDraft)
  const saveEdit = useCallback(
    (edit: NoteEdit) =>
      saveDraft(toDraftEditFromNoteEdit(noteKey, edit, locale)),
    [noteKey, locale, saveDraft],
  )
  return useDraftAutosave({
    saveEdit,
    mergeEdits: mergeDraftEdits<NoteFields, NoteContent>,
    lastSavedAt,
  })
}
