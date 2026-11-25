// @vitest-environment happy-dom
import { expect, test, vi } from 'vitest'

import { stubIntersectionObserver } from './stage.fixture'
import { watchActiveChapter } from './watch-active-chapter'

test('the section that reaches the middle line becomes the active chapter', () => {
  const intersections = stubIntersectionObserver()
  const sections = ['inizio', 'mezzo', 'fine'].map((id) => {
    const section = document.createElement('section')
    section.id = id
    return section
  })
  const onActiveChapter = vi.fn()
  const stop = watchActiveChapter(sections, onActiveChapter)

  const [, middle] = sections
  if (middle !== undefined) {
    intersections.reportActive(middle)
  }
  expect(onActiveChapter).toHaveBeenCalledWith(1)

  stop()
  if (middle !== undefined) {
    intersections.reportActive(middle)
  }
  expect(onActiveChapter).toHaveBeenCalledOnce()
})
