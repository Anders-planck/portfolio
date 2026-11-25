import type { QueryClient } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'

import { publishedNoteQueryOptions } from '../../entities/note/note-query-options'
import { pickNoteTranslation } from '../../entities/note/pick-note-translation'
import { toPlainTextFromNoteRuns } from '../../entities/note/to-plain-text-from-note-runs'
import type { Locale } from '../../shared/i18n/locale'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'

/** What the Nota page's head says: the note's title and summary as text. */
export interface NoteHeadCopy {
  title: string
  description: string
}

/**
 * For the Nota loader: the published note (awaited on the server, so the
 * first paint has it), or the 404 page for a slug no published note has.
 * Returns the head copy in the reader's language or its fallback.
 */
export async function loadNotePage(
  queryClient: QueryClient,
  slug: string,
  locale: Locale,
): Promise<NoteHeadCopy> {
  const note = await queryClient.query(publishedNoteQueryOptions(slug))
  const picked =
    note === null ? null : pickNoteTranslation(note.translations, locale)
  if (picked === null || picked.kind === 'missing') {
    return showNotFound()
  }
  const { site, notes } = toMessagesFromLocale(locale)
  const title = toPlainTextFromNoteRuns(
    picked.content.title,
    notes.metricUnavailable,
  )
  return {
    title: `${title} · ${site.name}`,
    description: toPlainTextFromNoteRuns(
      picked.content.summary,
      notes.metricUnavailable,
    ),
  }
}

/** Hands the address to the router's 404 page. */
function showNotFound(): never {
  notFound({ throw: true })
  // `notFound({ throw: true })` always throws; its type does not say so.
  throw new Error('notFound did not throw')
}
