// @vitest-environment happy-dom
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { ImmersiveStage } from './immersive-stage'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  stubIntersectionObserver,
  TEST_CHAPTERS,
  TEST_FACES,
} from './stage.fixture'
import { toChapterScrollRanges } from './to-chapter-scroll-ranges'

let intersections: ReturnType<typeof stubIntersectionObserver>
const scrollIntoView =
  vi.fn<(options?: ScrollIntoViewOptions | boolean) => void>()

beforeEach(() => {
  intersections = stubIntersectionObserver()
  scrollIntoView.mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  cleanup()
})

function renderImmersiveStage() {
  return renderForReader(
    <ImmersiveStage
      chapters={TEST_CHAPTERS}
      chapterIds={TEST_CHAPTERS.map((chapter) => chapter.id)}
      scrollRanges={toChapterScrollRanges([20, 40, 20])}
      faces={TEST_FACES}
    />,
    ANIMATED_FINE_POINTER,
  )
}

test('each chapter scrolls as long as its range', async () => {
  renderImmersiveStage()
  await screen.findByRole('slider')
  const middle = document.getElementById('mezzo')
  expect(middle?.style.minHeight).toBe('150svh')
})

test('the chapter that covers the middle of the viewport is the active one', async () => {
  renderImmersiveStage()
  const navigation = await screen.findByRole('group', { name: 'Capitolo' })
  expect(navigation.textContent).toContain('00 / 02 · Inizio')

  const middle = document.getElementById('mezzo')
  expect(middle).not.toBeNull()
  act(() => {
    if (middle !== null) {
      intersections.reportActive(middle)
    }
  })
  expect(navigation.textContent).toContain('01 / 02 · Mezzo')
  const activeStep = screen
    .getByRole('list', { name: 'Capitoli' })
    .querySelector('[aria-current="step"]')
  expect(activeStep?.textContent).toContain('01 Mezzo')
})

test('next scrolls to the following chapter and puts it in the address', async () => {
  const { router } = renderImmersiveStage()
  fireEvent.click(
    await screen.findByRole('button', { name: 'Capitolo successivo' }),
  )
  expect(scrollIntoView).toHaveBeenCalledOnce()
  await vi.waitFor(() => {
    expect(router.state.location.hash).toBe('mezzo')
  })
})
