// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { NOTE_ROWS } from '../../entities/note/note-draft.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NotesTable } from './notes-table'

afterEach(cleanup)

test('a row shows title link, topic, status, languages and reading time', async () => {
  renderAtPath(<NotesTable rows={NOTE_ROWS} />, '/cms/note')

  expect(
    (
      await screen.findByRole('link', { name: 'Pubblicata da tempo' })
    ).getAttribute('href'),
  ).toBe('/cms/note/note-published')
  expect(screen.getByText(/^Pubblicata · 24 nov 2026/)).toBeDefined()
  expect(screen.getByText('IT · EN')).toBeDefined()
  expect(screen.getByText('7 min')).toBeDefined()
  expect(screen.getByText('Mobile')).toBeDefined()
  expect(screen.getByText('—')).toBeDefined()
})
