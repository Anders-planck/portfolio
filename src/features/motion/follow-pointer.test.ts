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
    host: document.body,
  }
}

/** A pointer move over `target` (the page itself by default). */
function movePointer(
  clientX: number,
  clientY: number,
  { pointerType = 'mouse', target = document.body } = {},
) {
  target.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerType,
      clientX,
      clientY,
      bubbles: true,
    }),
  )
}

function moveMouse(clientX: number, clientY: number) {
  movePointer(clientX, clientY)
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

  movePointer(50, 50, { pointerType: 'touch' })
  expect(parts.dot.style.transform).toBe('translate3d(10px, 10px, 0)')
  stopFollowing()
})

test('a pen keeps the system cursor and draws no ring', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  movePointer(10, 10, { pointerType: 'pen' })
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)
  expect(parts.ring.hasAttribute('data-active')).toBe(false)
  stopFollowing()
})

test('over a text field the native I-beam shows', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  const field = document.createElement('input')
  document.body.append(field)
  movePointer(10, 10)
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(true)
  movePointer(12, 10, { target: field })
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)
  field.remove()
  stopFollowing()
})

test('opening a menu hands over to the system cursor without the mouse moving', () => {
  const parts = createCursorParts()
  const stopFollowing = followPointer(parts, 0.5)
  moveMouse(10, 10)
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(true)

  const menu = document.createElement('div')
  menu.setAttribute('role', 'menu')
  document.body.append(menu)
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  pendingFrames.forEach((frame) => {
    frame(0)
  })
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)

  menu.remove()
  stopFollowing()
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)
})
