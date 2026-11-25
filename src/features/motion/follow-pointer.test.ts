// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { type CursorParts, followPointer } from './follow-pointer'

/** Frames the code under test asked for, to run one at a time. */
let pendingFrames: FrameRequestCallback[] = []

function runNextFrame() {
  const frame = pendingFrames.shift()
  frame?.(0)
}

function createCursorParts(): CursorParts {
  return {
    ring: document.createElement('div'),
    dot: document.createElement('div'),
    label: document.createElement('span'),
  }
}

function moveMouse(clientX: number, clientY: number) {
  window.dispatchEvent(
    new PointerEvent('pointermove', { pointerType: 'mouse', clientX, clientY }),
  )
}

beforeEach(() => {
  pendingFrames = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    pendingFrames.push(callback)
    return pendingFrames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('the dot is on the pointer at once; the ring starts under it', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  moveMouse(100, 40)
  expect(parts.dot.style.transform).toBe('translate3d(100px, 40px, 0)')
  runNextFrame()
  expect(parts.ring.style.transform).toBe('translate3d(100px, 40px, 0)')
  expect(parts.ring.hasAttribute('data-active')).toBe(true)
  stopFollowing()
})

test('the ring catches up with inertia and stops the loop once settled', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  moveMouse(0, 0)
  runNextFrame()
  moveMouse(100, 0)
  runNextFrame()
  expect(parts.ring.style.transform).toBe('translate3d(50px, 0px, 0)')
  runNextFrame()
  expect(parts.ring.style.transform).toBe('translate3d(75px, 0px, 0)')

  while (pendingFrames.length > 0) {
    runNextFrame()
  }
  expect(parts.ring.style.transform).toBe('translate3d(100px, 0px, 0)')
  stopFollowing()
})

test('the cursor hides when the pointer leaves the page, and a finger is ignored', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  moveMouse(10, 10)
  document.documentElement.dispatchEvent(new PointerEvent('pointerleave'))
  expect(parts.ring.hasAttribute('data-active')).toBe(false)
  expect(parts.dot.hasAttribute('data-active')).toBe(false)

  window.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerType: 'touch',
      clientX: 50,
      clientY: 50,
    }),
  )
  expect(parts.dot.style.transform).toBe('translate3d(10px, 10px, 0)')
  stopFollowing()
})
