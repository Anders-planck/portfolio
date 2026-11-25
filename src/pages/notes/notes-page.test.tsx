// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { NOTE_CARD, toPlainRuns } from '../../entities/note/note.fixture'
import {
  type NoteCard,
  publishedNotesQueryOptions,
} from '../../entities/note/note-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NotesPage } from './notes-page'

afterEach(cleanup)

const MOBILE_CARD: NoteCard = {
  ...NOTE_CARD,
  slug: 'mtls-expo',
  topic: 'mobile',
  translations: [
    {
      locale: 'it',
      title: toPlainRuns('mTLS in un’app Expo'),
      summary: toPlainRuns('Keychain e Keystore.'),
      readingMinutes: 4,
    },
  ],
}

function renderNotesAt(path: string, cards: NoteCard[]) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(publishedNotesQueryOptions().queryKey, cards)
  return renderAtPath(<NotesPage />, path, queryClient)
}

test('the list links each published note with its date, topic and reading time', async () => {
  renderNotesAt('/', [NOTE_CARD])

  const link = await screen.findByRole('link', {
    name: /Cosa cerco nel codice di un agente/,
  })
  expect(link.getAttribute('href')).toBe('/note/review-agenti')
  expect(screen.getByText('24 nov 2026')).toBeDefined()
  expect(screen.getByText('AI · 7 min')).toBeDefined()
})

test('the topic filter counts the listed notes and narrows the list', async () => {
  renderNotesAt('/en', [NOTE_CARD, MOBILE_CARD])

  expect(await screen.findByRole('radio', { name: 'All · 2' })).toBeDefined()
  expect(screen.getByRole('radio', { name: 'AI · 1' })).toBeDefined()
  fireEvent.click(screen.getByRole('radio', { name: 'Mobile · 1' }))

  expect(screen.queryByRole('link', { name: /Cosa cerco/ })).toBeNull()
  expect(screen.getByRole('link', { name: /mTLS/ }).getAttribute('href')).toBe(
    '/en/note/mtls-expo',
  )
})

test('with nothing published the list says so', async () => {
  renderNotesAt('/', [])

  expect(
    await screen.findByText('Ancora nessuna nota pubblicata.'),
  ).toBeDefined()
  expect(screen.queryByRole('radiogroup')).toBeNull()
})
