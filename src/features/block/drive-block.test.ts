// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { waitForFrames } from './block.fixture'
import type { BlockPose } from './block-pose'
import { driveBlock } from './drive-block'

let dragArea: HTMLElement
let block: HTMLElement
let scrollPose: BlockPose

beforeEach(() => {
  dragArea = document.createElement('div')
  block = document.createElement('div')
  dragArea.append(block)
  document.body.append(dragArea)
  scrollPose = { yawDeg: 0, scale: 1 }
})

afterEach(() => {
  dragArea.remove()
})

function startDrive() {
  const onFrontFaceChange = vi.fn()
  const drive = driveBlock(
    { dragArea, block },
    { readScrollPose: () => scrollPose, onFrontFaceChange },
  )
  return { drive, onFrontFaceChange }
}

test('scrolling writes the new pose straight to the element', async () => {
  const { drive } = startDrive()
  await waitForFrames()
  expect(block.style.transform).toBe('rotateX(-14deg) rotateY(0deg) scale(1)')

  scrollPose = { yawDeg: 30, scale: 0.8 }
  window.dispatchEvent(new Event('scroll'))
  await waitForFrames()
  expect(block.style.transform).toBe(
    'rotateX(-14deg) rotateY(30deg) scale(0.8)',
  )
  drive.stop()
})

test('the front face is reported once, and again only when it changes', async () => {
  const { drive, onFrontFaceChange } = startDrive()
  await waitForFrames()
  scrollPose = { yawDeg: 20, scale: 1 }
  window.dispatchEvent(new Event('scroll'))
  await waitForFrames()
  expect(onFrontFaceChange.mock.calls).toEqual([[0]])

  drive.turnByFaces(1)
  await waitForFrames()
  expect(onFrontFaceChange.mock.calls).toEqual([[0], [1]])
  drive.stop()
})

test('stopping leaves the Block at its rest pose and stops listening', async () => {
  const { drive } = startDrive()
  await waitForFrames()
  drive.stop()
  expect(block.style.transform).toBe('')
  window.dispatchEvent(new Event('scroll'))
  await waitForFrames()
  expect(block.style.transform).toBe('')
})
