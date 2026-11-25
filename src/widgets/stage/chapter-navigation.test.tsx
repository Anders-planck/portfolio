// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ChapterNavigation } from './chapter-navigation'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  TEST_CHAPTERS,
} from './stage.fixture'

afterEach(cleanup)

function renderAt(activeChapterIndex: number) {
  const goToAdjacentChapter = vi.fn((step: number) => {
    const chapterIndex = activeChapterIndex + step
    return chapterIndex >= 0 && chapterIndex < TEST_CHAPTERS.length
      ? chapterIndex
      : undefined
  })
  const rendered = renderForReader(
    <ChapterNavigation
      chapters={TEST_CHAPTERS}
      activeChapterIndex={activeChapterIndex}
      onGoToAdjacentChapter={goToAdjacentChapter}
    />,
    ANIMATED_FINE_POINTER,
  )
  return { goToAdjacentChapter, ...rendered }
}

function readAnnouncement(container: HTMLElement) {
  // Astryx buttons carry their own (empty) status regions.
  return container.querySelector('[aria-live]:not([role])')?.textContent
}

test('it names the active chapter as n / N with the eyebrow numbers', async () => {
  renderAt(1)
  const navigation = await screen.findByRole('group', { name: 'Capitolo' })
  expect(navigation.textContent).toContain('01 / 02 · Mezzo')
})

test('previous and next step back and forward and announce where to', async () => {
  const { goToAdjacentChapter, container } = renderAt(1)
  await screen.findByRole('group', { name: 'Capitolo' })
  expect(readAnnouncement(container)).toBe('')

  fireEvent.click(screen.getByRole('button', { name: 'Capitolo successivo' }))
  expect(readAnnouncement(container)).toBe('02 / 02 · Fine')
  fireEvent.click(screen.getByRole('button', { name: 'Capitolo precedente' }))
  expect(goToAdjacentChapter.mock.calls).toEqual([[1], [-1]])
  expect(readAnnouncement(container)).toBe('00 / 02 · Inizio')
})

test('at the opening, previous stays focusable, is marked unavailable and announces nothing', async () => {
  const { container } = renderAt(0)
  const previous = await screen.findByRole('button', {
    name: 'Capitolo precedente',
  })
  expect(previous.getAttribute('aria-disabled')).toBe('true')
  expect(previous.hasAttribute('disabled')).toBe(false)
  fireEvent.click(previous)
  expect(readAnnouncement(container)).toBe('')
})
