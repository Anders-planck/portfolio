// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { noteRowsQueryOptions } from '../../entities/note/note-draft'
import { NOTE_ROWS } from '../../entities/note/note-draft.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { CmsNotesPage } from './cms-notes-page'

const createNote = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => createNote }))

beforeEach(() => {
  createNote.mockReset()
})
afterEach(cleanup)

function renderList(rows: typeof NOTE_ROWS) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(noteRowsQueryOptions().queryKey, rows)
  return renderAtPath(<CmsNotesPage />, '/cms/note', queryClient)
}

test('the list shows every note and filters by publication state', async () => {
  renderList(NOTE_ROWS)

  expect(await screen.findByRole('radio', { name: 'Tutte · 2' })).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Pubblicata da tempo' }),
  ).toBeDefined()
  fireEvent.click(screen.getByRole('radio', { name: 'Bozze · 1' }))

  expect(screen.queryByRole('link', { name: 'Pubblicata da tempo' })).toBeNull()
  expect(screen.getByRole('link', { name: 'Nota senza titolo' })).toBeDefined()
})

test('a filter with no notes says so', async () => {
  renderList(NOTE_ROWS)

  fireEvent.click(await screen.findByRole('radio', { name: 'Programmate · 0' }))

  expect(screen.getByText('Nessuna nota in questo stato')).toBeDefined()
})

test('with no notes yet the list says so', async () => {
  renderList([])

  expect(await screen.findByText('Ancora nessuna nota')).toBeDefined()
})

test('a create whose answer was lost is retried with the same note key', async () => {
  createNote.mockRejectedValueOnce(new Error('network'))
  createNote.mockImplementation(({ key }: { key: string }) =>
    Promise.resolve({ kind: 'created', key }),
  )
  const { router } = renderList([])
  const button = await screen.findByRole('button', { name: 'Nuova nota' })

  fireEvent.click(button)
  expect(
    await screen.findByText('Non riesco a creare la nota: riprova.'),
  ).toBeDefined()
  fireEvent.click(button)

  await waitFor(() => {
    expect(createNote).toHaveBeenCalledTimes(2)
  })
  const [[first], [second]] = createNote.mock.calls as [
    [{ key: string }],
    [{ key: string }],
  ]
  expect(second.key).toBe(first.key)
  // Navigation can take a moment while the whole suite runs in parallel.
  await waitFor(
    () => {
      expect(router.state.location.pathname).toBe(`/cms/note/${first.key}`)
    },
    { timeout: 5000 },
  )
})

test('past the note limit the list says so and opens nothing', async () => {
  createNote.mockResolvedValue({ kind: 'limit-reached' })
  const { router } = renderList([])

  fireEvent.click(await screen.findByRole('button', { name: 'Nuova nota' }))

  expect(
    await screen.findByText('Hai raggiunto il numero massimo di note.'),
  ).toBeDefined()
  expect(router.state.location.pathname).toBe('/cms/note')
})
