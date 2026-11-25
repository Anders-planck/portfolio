// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { createAppearance } from '../../entities/appearance/appearance.fixture'
import { Cursor } from './cursor'
import { stubReaderSettings } from './motion.fixture'
import { MotionProvider } from './motion-provider'

vi.mock('../../entities/appearance/use-appearance', () => ({
  useAppearance: () => ({ appearance: createAppearance(), css: undefined }),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderCursor() {
  return render(<Cursor />, { wrapper: MotionProvider })
}

test('with a mouse it draws a ring that lights up over a link', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: true })
  vi.stubGlobal('requestAnimationFrame', () => 1)
  const { container, unmount } = renderCursor()
  const ring = container.querySelector('[data-cursor-ring]')
  expect(ring).not.toBeNull()
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(true)

  const link = document.createElement('a')
  link.href = '/lavori'
  document.body.append(link)
  link.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerType: 'mouse',
      clientX: 40,
      clientY: 50,
      bubbles: true,
    }),
  )
  expect(ring?.hasAttribute('data-active')).toBe(true)
  expect(ring?.hasAttribute('data-link')).toBe(true)

  unmount()
  link.remove()
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)
})

test('with reduced motion there is no ring and the system cursor stays', () => {
  stubReaderSettings({ isReducedMotion: true, hasFinePointer: true })
  const { container } = renderCursor()
  expect(container.querySelector('[data-cursor-ring]')).toBeNull()
  expect(document.body.hasAttribute('data-custom-cursor')).toBe(false)
})

test('on touch there is no ring', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: false })
  const { container } = renderCursor()
  expect(container.querySelector('[data-cursor-ring]')).toBeNull()
})
