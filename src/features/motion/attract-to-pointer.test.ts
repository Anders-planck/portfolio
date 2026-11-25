// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vitest'

import { attractToPointer } from './attract-to-pointer'

const OPTIONS = { radiusPx: 200, strength: 0.35 }

afterEach(() => {
  vi.unstubAllGlobals()
})

test('the control follows a mouse and lets go on cleanup', () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  const button = document.createElement('button')
  button.getBoundingClientRect = () => new DOMRect(100, 100, 80, 40)
  const stopAttracting = attractToPointer(button, OPTIONS)

  window.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerType: 'mouse',
      clientX: 160,
      clientY: 130,
    }),
  )
  expect(button.style.transform).toBe('translate(7px, 3.5px)')

  stopAttracting()
  expect(button.style.transform).toBe('')
})

test('a finger never moves the control', () => {
  const button = document.createElement('button')
  const stopAttracting = attractToPointer(button, OPTIONS)
  window.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerType: 'touch',
      clientX: 160,
      clientY: 130,
    }),
  )
  expect(button.style.transform).toBe('')
  stopAttracting()
})

test('the control measures its box once, not mid-pull, until a scroll moves it', () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    // Already ran: no frame is left pending.
    return 0
  })
  const button = document.createElement('button')
  const measure = vi.fn(() => new DOMRect(100, 100, 80, 40))
  button.getBoundingClientRect = measure
  const stopAttracting = attractToPointer(button, OPTIONS)
  const moveMouseTo = (clientX: number) => {
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerType: 'mouse',
        clientX,
        clientY: 120,
      }),
    )
  }

  moveMouseTo(150)
  moveMouseTo(160)
  expect(measure).toHaveBeenCalledTimes(1)
  expect(button.style.transform).toBe('translate(7px, 0px)')

  window.dispatchEvent(new Event('scroll'))
  moveMouseTo(160)
  expect(measure).toHaveBeenCalledTimes(2)
  stopAttracting()
})
