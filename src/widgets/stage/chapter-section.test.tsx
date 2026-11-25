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
    <ChapterSection chapter={OPENING} chapterIndex={0} />,
    ANIMATED_FINE_POINTER,
  )
  const section = await screen.findByRole('region', {
    name: 'Titolo di apertura',
  })
  expect(section.id).toBe('inizio')
  expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  expect(screen.getByText('00 / Inizio')).toBeDefined()
  expect(screen.getByText('Testo di Inizio')).toBeDefined()
})

test('a later chapter is an h2, as tall as its scroll range when pinned', async () => {
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
  expect(section.style.minHeight).toBe('150svh')
})
