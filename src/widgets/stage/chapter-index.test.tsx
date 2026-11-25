// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ChapterIndex } from './chapter-index'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  TEST_CHAPTERS,
} from './stage.fixture'

afterEach(cleanup)

test('the index lists the chapters with their numbers and marks the active one', async () => {
  const goToChapter = vi.fn()
  renderForReader(
    <ChapterIndex
      chapters={TEST_CHAPTERS}
      activeChapterIndex={1}
      onGoToChapter={goToChapter}
    />,
    ANIMATED_FINE_POINTER,
  )
  const index = await screen.findByRole('list', { name: 'Capitoli' })
  expect(index.querySelector('[aria-current="step"]')?.textContent).toContain(
    '01 Mezzo',
  )
  fireEvent.click(screen.getByRole('button', { name: /02 Fine/ }))
  expect(goToChapter).toHaveBeenCalledWith(2)
})
