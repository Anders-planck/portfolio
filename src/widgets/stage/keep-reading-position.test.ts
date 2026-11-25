// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { waitForFrames } from '../../features/block/block.fixture'
import { keepReadingPosition } from './keep-reading-position'

const VIEWPORT_HEIGHT_PX = 800

let chapters: HTMLElement
let sectionTopsPx: number[]
let sectionHeightsPx: number[]
let flipLayout: () => void
const scrollTo = vi.fn<(options: ScrollToOptions) => void>()

/** Chapter sections placed where `sectionTopsPx` and `sectionHeightsPx` say. */
function placeSections() {
  chapters = document.createElement('div')
  ;[0, 1, 2].forEach((sectionIndex) => {
    const section = document.createElement('section')
    section.getBoundingClientRect = () =>
      new DOMRect(
        0,
        (sectionTopsPx[sectionIndex] ?? 0) - window.scrollY,
        100,
        sectionHeightsPx[sectionIndex] ?? 0,
      )
    chapters.append(section)
  })
}

beforeEach(() => {
  sectionTopsPx = [0, 800, 1600]
  sectionHeightsPx = [800, 800, 800]
  placeSections()
  scrollTo.mockClear()
  window.scrollTo = scrollTo as typeof window.scrollTo
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: VIEWPORT_HEIGHT_PX,
  })
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 })
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: true,
      addEventListener: (_type: string, listener: () => void) => {
        flipLayout = listener
      },
      removeEventListener: () => undefined,
    }),
  })
})

afterEach(() => {
  scrollTo.mockClear()
})

test('a switch of layout brings the same point of the chapter back under the middle line', async () => {
  const stop = keepReadingPosition(chapters)
  window.dispatchEvent(new Event('scroll'))
  await waitForFrames()
  // The middle line (1400px) was 600px into the second chapter: 75 %.
  sectionTopsPx = [0, 3000, 5000]
  sectionHeightsPx = [3000, 2000, 2000]

  flipLayout()
  expect(scrollTo).toHaveBeenCalledWith({
    top: 3000 + 0.75 * 2000 - VIEWPORT_HEIGHT_PX / 2,
    behavior: 'instant',
  })
  stop()
})

test('above every chapter there is nothing to restore', () => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  sectionTopsPx = [600, 1400, 2200]
  const stop = keepReadingPosition(chapters)
  flipLayout()
  expect(scrollTo).not.toHaveBeenCalled()
  stop()
})
