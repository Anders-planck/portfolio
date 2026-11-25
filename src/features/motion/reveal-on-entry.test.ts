// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { revealOnEntry } from './reveal-on-entry'

const OPTIONS = { entryDistancePx: 28, staggerDelayMs: 60 }

/** The observer callbacks the code under test registered, to fire by hand. */
let observerCallbacks: IntersectionObserverCallback[] = []

class StubIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallbacks.push(callback)
  }
  observe(): void {
    // The tests fire the callback by hand.
  }
  disconnect(): void {
    // Nothing to stop.
  }
}

/** Tells every observer the block scrolled into view. */
function scrollIntoView() {
  observerCallbacks.forEach((callback) => {
    callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
  })
}

/** A list whose top sits at `topPx` from the top of the viewport. */
function createListAt(topPx: number) {
  const list = document.createElement('ul')
  list.innerHTML = '<li>uno</li><li>due</li>'
  list.getBoundingClientRect = () => new DOMRect(0, topPx, 200, 80)
  const items = Array.from(list.querySelectorAll('li'))
  const animations = items.map((item) => {
    const animate = vi.fn<HTMLElement['animate']>()
    item.animate = animate
    return animate
  })
  return { list, items, animations }
}

beforeEach(() => {
  observerCallbacks = []
  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('a block already on screen is left as it is', () => {
  const { list, items } = createListAt(10)
  revealOnEntry(list, items, OPTIONS)
  expect(items.map((item) => item.style.opacity)).toEqual(['', ''])
  expect(observerCallbacks).toHaveLength(0)
})

test('a block below the fold hides, then comes in one item after another', () => {
  const { list, items, animations } = createListAt(window.innerHeight + 100)
  revealOnEntry(list, items, OPTIONS)
  expect(items.map((item) => item.style.opacity)).toEqual(['0', '0'])

  scrollIntoView()
  expect(items.map((item) => item.style.opacity)).toEqual(['', ''])
  expect(animations.map((animate) => animate.mock.calls[0]?.[1])).toMatchObject(
    [{ delay: 0 }, { delay: 60 }],
  )
})

test('the cleanup shows the items again', () => {
  const { list, items } = createListAt(window.innerHeight + 100)
  const stopRevealing = revealOnEntry(list, items, OPTIONS)
  stopRevealing()
  expect(items.map((item) => item.style.opacity)).toEqual(['', ''])
})
