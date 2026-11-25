// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { NOTE_PAGE } from '../../entities/note/note.fixture'
import {
  type NotePage as PublishedNote,
  publishedNoteQueryOptions,
} from '../../entities/note/note-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NotePage } from './note-page'

afterEach(cleanup)

function renderNoteAt(path: string, note: PublishedNote | null) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(
    publishedNoteQueryOptions(NOTE_PAGE.slug).queryKey,
    note,
  )
  return renderAtPath(<NotePage slug={NOTE_PAGE.slug} />, path, queryClient)
}

test('Nota shows the note with its Outline, progress and next note', async () => {
  renderNoteAt('/note/review-agenti', NOTE_PAGE)

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Cosa cerco nel codice di un agente',
    }),
  ).toBeDefined()
  expect(
    screen.getByRole('navigation', { name: 'In questa nota' }),
  ).toBeDefined()
  expect(
    screen.getByRole('progressbar', { name: 'Avanzamento della lettura' }),
  ).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Regole nel lint' }).getAttribute('href'),
  ).toBe('/note/regole-nel-lint')
  expect(screen.queryByText(/non è ancora tradotta/)).toBeNull()
})

test('an untranslated locale shows the Italian note with the notice', async () => {
  renderNoteAt('/en/note/review-agenti', NOTE_PAGE)

  expect(
    await screen.findByText(
      'This page is not translated yet: you are reading it in Italiano.',
    ),
  ).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'All notes' }).getAttribute('href'),
  ).toBe('/en/note')
})

test('a note unpublished while open shows the not-found message', async () => {
  renderNoteAt('/note/review-agenti', null)

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Questa pagina non esiste, o non più.',
    }),
  ).toBeDefined()
})
