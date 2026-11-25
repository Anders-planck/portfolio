import { QueryClient } from '@tanstack/react-query'
import { isNotFound } from '@tanstack/react-router'
import { expect, test } from 'vitest'

import { NOTE_PAGE } from '../../entities/note/note.fixture'
import {
  type NotePage,
  publishedNoteQueryOptions,
} from '../../entities/note/note-query-options'
import { loadNotePage } from './load-note-page'

function toQueryClientWith(note: NotePage | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  queryClient.setQueryData(
    publishedNoteQueryOptions(NOTE_PAGE.slug).queryKey,
    note,
  )
  return queryClient
}

test('the head copy is the note’s title and summary in the reader’s fallback', async () => {
  await expect(
    loadNotePage(toQueryClientWith(NOTE_PAGE), NOTE_PAGE.slug, 'de'),
  ).resolves.toEqual({
    title: 'Cosa cerco nel codice di un agente · Anders Planck',
    description: 'Errori tipici e come li intercetto.',
  })
})

test('a slug no published note has is the 404 page', async () => {
  const outcome = await loadNotePage(
    toQueryClientWith(null),
    NOTE_PAGE.slug,
    'it',
  ).catch((error: unknown) => error)

  expect(isNotFound(outcome)).toBe(true)
})
