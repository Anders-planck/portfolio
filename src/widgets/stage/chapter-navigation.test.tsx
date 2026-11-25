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
  const goToChapter = vi.fn()
  renderForReader(
    <ChapterNavigation
      chapters={TEST_CHAPTERS}
      activeChapterIndex={activeChapterIndex}
      onGoToChapter={goToChapter}
    />,
    ANIMATED_FINE_POINTER,
  )
  return goToChapter
}

test('it names the active chapter as n / N with the eyebrow numbers', async () => {
  renderAt(1)
  const navigation = await screen.findByRole('group', { name: 'Capitolo' })
  expect(navigation.textContent).toContain('01 / 02 · Mezzo')
})

test('previous and next go one chapter back and forward', async () => {
  const goToChapter = renderAt(1)
  fireEvent.click(
    await screen.findByRole('button', { name: 'Capitolo precedente' }),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Capitolo successivo' }))
  expect(goToChapter.mock.calls).toEqual([[0], [2]])
})

test('at the opening, previous stays focusable but is marked unavailable', async () => {
  renderAt(0)
  const previous = await screen.findByRole('button', {
    name: 'Capitolo precedente',
  })
  expect(previous.getAttribute('aria-disabled')).toBe('true')
  expect(previous.hasAttribute('disabled')).toBe(false)
})
