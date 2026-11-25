import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

/** A published note as the Note list shows it, every translation included. */
export type NoteCard = FunctionReturnType<
  typeof api.notes.listPublished
>[number]

/** A published note as the Nota page shows it. */
export type NotePage = NonNullable<
  FunctionReturnType<typeof api.notes.getPublished>
>

export type NotePageTranslation = NotePage['translations'][number]

export type NoteBlock = NotePageTranslation['blocks'][number]

export type NoteInlineRun = NotePageTranslation['title'][number]

export type NoteTopic = NoteCard['topic']

/** Every published note, live: a publish reaches open pages. */
export function publishedNotesQueryOptions() {
  return convexQueryOptions(api.notes.listPublished, {})
}

/** One published note by slug (null when none), live. */
export function publishedNoteQueryOptions(slug: string) {
  return convexQueryOptions(api.notes.getPublished, { slug })
}
