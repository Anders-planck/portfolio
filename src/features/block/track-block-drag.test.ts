// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { trackBlockDrag } from './track-block-drag'

let handle: HTMLElement
let block: HTMLElement

beforeEach(() => {
  handle = document.createElement('div')
  block = document.createElement('div')
  handle.setPointerCapture = vi.fn()
  handle.append(block)
})

function press(type: string, init: PointerEventInit) {
  handle.dispatchEvent(
    new PointerEvent(type, { pointerId: 1, button: 0, ...init }),
  )
}

function startTracking() {
  const onDragMove = vi.fn()
  const onDragEnd = vi.fn()
  const stop = trackBlockDrag(
    { handle, block },
    { readTurnYawDeg: () => 10, onDragMove, onDragEnd },
  )
  return { onDragMove, onDragEnd, stop }
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('a mouse drag turns across and tips within a limit, then ends', () => {
  const { onDragMove, onDragEnd, stop } = startTracking()
  press('pointerdown', { pointerType: 'mouse', clientX: 100, clientY: 100 })
  expect(block.hasAttribute('data-dragging')).toBe(true)

  press('pointermove', { pointerType: 'mouse', clientX: 200, clientY: -200 })
  expect(onDragMove).toHaveBeenCalledWith({
    turnYawDeg: 10 + 100 * 0.45,
    dragPitchDeg: 20,
  })

  press('pointerup', { pointerType: 'mouse', clientX: 200, clientY: -200 })
  expect(onDragEnd).toHaveBeenCalledOnce()
  expect(block.hasAttribute('data-dragging')).toBe(false)
  stop()
})

test('a finger scrolls the page instead of dragging the Block', () => {
  const { onDragMove, stop } = startTracking()
  press('pointerdown', { pointerType: 'touch', clientX: 100, clientY: 100 })
  press('pointermove', { pointerType: 'touch', clientX: 200, clientY: 100 })
  expect(onDragMove).not.toHaveBeenCalled()
  expect(block.hasAttribute('data-dragging')).toBe(false)
  stop()
})
