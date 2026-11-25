import type { FunctionArgs, FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import type { Locale } from '../../shared/i18n/locale'

/** A note as the editor opens it in one locale, or null for an unknown key. */
export type EditableNote = NonNullable<
  FunctionReturnType<typeof api.notes.getEditableNote>
>
export type NoteFields = EditableNote['fields']
export type NoteContent = EditableNote['content']
export type NotePublication = EditableNote['publication']
export type NoteFinding = EditableNote['findings'][number]

/** A row of the CMS Note list. */
export type NoteRow = FunctionReturnType<typeof api.notes.listNotes>[number]

/** One live-save edit: some shared fields and/or some fields of the locale. */
export interface NoteEdit {
  fields?: Partial<NoteFields>
  content?: Partial<NoteContent>
}

/** Every note draft, for the CMS list. */
export function noteRowsQueryOptions() {
  return convexQueryOptions(api.notes.listNotes, {})
}

/** The draft the editor opens in one locale, live. */
export function noteDraftQueryOptions(key: string, locale: Locale) {
  return convexQueryOptions(api.notes.getEditableNote, { key, locale })
}

/** The `notes.saveDraft` arguments for an edit of note `key` in `locale`. */
export function toDraftEditFromNoteEdit(
  key: string,
  edit: NoteEdit,
  locale: Locale,
): FunctionArgs<typeof api.notes.saveDraft> {
  return {
    key,
    ...(edit.fields === undefined ? {} : { fields: edit.fields }),
    ...(edit.content === undefined
      ? {}
      : { localeEdit: { locale, content: edit.content } }),
  }
}
