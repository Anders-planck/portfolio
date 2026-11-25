// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { PUBLISHED_AT } from '../../entities/note/note.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NoteMeta } from './note-meta'

afterEach(cleanup)

test('the meta line shows date, topic, reading time and the other languages', async () => {
  renderAtPath(
    <NoteMeta
      slug="review-agenti"
      publishedAt={PUBLISHED_AT}
      topic="architecture"
      readingMinutes={7}
      otherLocales={['en', 'de']}
    />,
    '/fr/note/review-agenti',
  )

  expect(await screen.findByText('24 nov. 2026')).toBeDefined()
  expect(screen.getByText('Architecture · 7 min')).toBeDefined()
  expect(screen.getByRole('link', { name: 'EN' }).getAttribute('href')).toBe(
    '/en/note/review-agenti',
  )
  expect(screen.getByRole('link', { name: 'DE' }).getAttribute('href')).toBe(
    '/de/note/review-agenti',
  )
})

test('a note in one language only links no other language', async () => {
  renderAtPath(
    <NoteMeta
      slug="review-agenti"
      publishedAt={PUBLISHED_AT}
      topic="ai"
      readingMinutes={1}
      otherLocales={[]}
    />,
    '/',
  )

  expect(await screen.findByText('AI · 1 min')).toBeDefined()
  expect(screen.queryByText(/Disponibile anche in/)).toBeNull()
})
