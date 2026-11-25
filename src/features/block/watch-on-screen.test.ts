// @vitest-environment happy-dom
import { expect, test, vi } from 'vitest'

import { watchOnScreen } from './watch-on-screen'

test('each change of visibility is reported, and none after the cleanup', () => {
  let report: IntersectionObserverCallback = () => undefined
  const disconnect = vi.fn()
  class TestIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      report = callback
    }
    observe() {
      return undefined
    }
    disconnect() {
      disconnect()
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: TestIntersectionObserver,
  })
  const onChange = vi.fn()
  const element = document.createElement('div')
  const stop = watchOnScreen(element, onChange)

  report(
    [{ isIntersecting: false } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  )
  expect(onChange).toHaveBeenCalledWith(false)
  stop()
  expect(disconnect).toHaveBeenCalledOnce()
})
