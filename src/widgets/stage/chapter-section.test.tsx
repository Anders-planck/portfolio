// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { ChapterSection } from './chapter-section'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  TEST_CHAPTERS,
} from './stage.fixture'

afterEach(cleanup)

const [OPENING, MIDDLE] = TEST_CHAPTERS

test('the opening is an h1 section with its anchor and the eyebrow 00', async () => {
  if (OPENING === undefined) {
    throw new Error('the fixture has an opening chapter')
  }
  renderForReader(
    <ChapterSection chapter={OPENING} chapterIndex={0} lengthInViewports={1} />,
    ANIMATED_FINE_POINTER,
  )
  const section = await screen.findByRole('region', {
    name: 'Titolo di apertura',
  })
  expect(section.id).toBe('inizio')
  expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  expect(screen.getByText('00 / Inizio')).toBeDefined()
  expect(screen.getByText('Testo di Inizio')).toBeDefined()
  // One viewport: the pinned text alone, no spacer.
  expect(section.children).toHaveLength(1)
})

test('a longer chapter is an h2 with a spacer for the rest of its range', async () => {
  if (MIDDLE === undefined) {
    throw new Error('the fixture has a middle chapter')
  }
  renderForReader(
    <ChapterSection
      chapter={MIDDLE}
      chapterIndex={1}
      lengthInViewports={1.5}
    />,
    ANIMATED_FINE_POINTER,
  )
  const section = await screen.findByRole('region', { name: 'Titolo di mezzo' })
  expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
  expect(screen.getByText('01 / Mezzo')).toBeDefined()
  const spacer = section.lastElementChild
  expect(spacer?.getAttribute('aria-hidden')).toBe('true')
  expect(spacer?.querySelector('*')).toBeNull()
})
