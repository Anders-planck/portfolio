// @vitest-environment happy-dom
import { beforeEach, expect, test, vi } from 'vitest'

import { trackBlockDrag } from './track-block-drag'

let dragArea: HTMLElement
let block: HTMLElement

beforeEach(() => {
  dragArea = document.createElement('div')
  block = document.createElement('div')
  dragArea.setPointerCapture = vi.fn()
  dragArea.append(block)
})

function press(type: string, init: PointerEventInit) {
  dragArea.dispatchEvent(
    new PointerEvent(type, { pointerId: 1, button: 0, ...init }),
  )
}

function startTracking() {
  const onDragMove = vi.fn()
  const onDragEnd = vi.fn()
  const stop = trackBlockDrag(
    { dragArea, block },
    { readTurnYawDeg: () => 10, onDragMove, onDragEnd },
  )
  return { onDragMove, onDragEnd, stop }
}

test('a mouse drag turns across and tips within a limit, then ends', () => {
  const { onDragMove, onDragEnd, stop } = startTracking()
  press('pointerdown', { pointerType: 'mouse', clientX: 100, clientY: 100 })
  press('pointermove', { pointerType: 'mouse', clientX: 200, clientY: -200 })
  expect(block.hasAttribute('data-dragging')).toBe(true)
  expect(onDragMove).toHaveBeenCalledWith({
    turnYawDeg: 10 + 100 * 0.45,
    dragPitchDeg: 20,
  })

  press('pointerup', { pointerType: 'mouse', clientX: 200, clientY: -200 })
  expect(onDragEnd).toHaveBeenCalledOnce()
  expect(block.hasAttribute('data-dragging')).toBe(false)
  stop()
})

test('a click that does not move is not a drag', () => {
  const { onDragMove, onDragEnd, stop } = startTracking()
  press('pointerdown', { pointerType: 'mouse', clientX: 100, clientY: 100 })
  press('pointermove', { pointerType: 'mouse', clientX: 102, clientY: 101 })
  press('pointerup', { pointerType: 'mouse', clientX: 102, clientY: 101 })
  expect(onDragMove).not.toHaveBeenCalled()
  expect(onDragEnd).not.toHaveBeenCalled()
  expect(block.hasAttribute('data-dragging')).toBe(false)
  stop()
})

test('a lost pointer capture ends the drag', () => {
  const { onDragEnd, stop } = startTracking()
  press('pointerdown', { pointerType: 'pen', clientX: 100, clientY: 100 })
  press('pointermove', { pointerType: 'pen', clientX: 140, clientY: 100 })
  press('lostpointercapture', { pointerType: 'pen' })
  expect(onDragEnd).toHaveBeenCalledOnce()
  expect(block.hasAttribute('data-dragging')).toBe(false)
  stop()
})

test('a finger scrolls the page instead of dragging the Block', () => {
  const { onDragMove, stop } = startTracking()
  press('pointerdown', { pointerType: 'touch', clientX: 100, clientY: 100 })
  press('pointermove', { pointerType: 'touch', clientX: 200, clientY: 100 })
  expect(onDragMove).not.toHaveBeenCalled()
  stop()
})

test('a pen over the Block keeps its drag from scrolling; a finger does not', () => {
  const { stop } = startTracking()
  press('pointerover', { pointerType: 'pen' })
  expect(dragArea.style.touchAction).toBe('none')
  press('pointerover', { pointerType: 'touch' })
  expect(dragArea.style.touchAction).toBe('')
  stop()
})
