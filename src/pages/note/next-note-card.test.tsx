// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { toPlainRuns } from '../../entities/note/note.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NextNoteCard } from './next-note-card'

afterEach(cleanup)

test('the next note links in the reader’s language, with its fallback title', async () => {
  renderAtPath(
    <NextNoteCard
      next={{
        slug: 'regole-nel-lint',
        translations: [{ locale: 'it', title: toPlainRuns('Regole nel lint') }],
      }}
    />,
    '/de/note/review-agenti',
  )

  expect(await screen.findByText('Nächste Notiz')).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Regole nel lint' }).getAttribute('href'),
  ).toBe('/de/note/regole-nel-lint')
})

test('a next note no reader’s fallback covers is not shown', () => {
  renderAtPath(
    <NextNoteCard
      next={{
        slug: 'solo-francese',
        translations: [{ locale: 'fr', title: toPlainRuns('Seulement') }],
      }}
    />,
    '/',
  )

  expect(screen.queryByRole('link')).toBeNull()
})
