// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { useElementHeight } from './use-element-height'

let notifyResize: (() => void) | null = null

vi.stubGlobal(
  'ResizeObserver',
  class {
    constructor(callback: () => void) {
      notifyResize = callback
    }
    observe() {
      // The test calls `notifyResize` itself.
    }
    disconnect() {
      notifyResize = null
    }
  },
)

afterEach(() => {
  notifyResize = null
})

function toElementOfHeight(height: { current: number }) {
  const element = document.createElement('div')
  element.getBoundingClientRect = () => new DOMRect(0, 0, 100, height.current)
  return element
}

test('the height is measured at once and again when the element resizes', () => {
  const height = { current: 7.6 }
  const elementRef = { current: toElementOfHeight(height) }
  const { result } = renderHook(() => useElementHeight(elementRef))

  expect(result.current).toBe(8)
  height.current = 20
  act(() => {
    notifyResize?.()
  })

  expect(result.current).toBe(20)
})

test('an element not mounted measures 0', () => {
  const { result } = renderHook(() => useElementHeight({ current: null }))

  expect(result.current).toBe(0)
})
