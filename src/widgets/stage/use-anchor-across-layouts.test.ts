// @vitest-environment happy-dom
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useAnchorAcrossLayouts } from './use-anchor-across-layouts'

const CHAPTER_IDS = ['inizio', 'mezzo']

let section: HTMLElement
let scrollIntoView: ReturnType<
  typeof vi.fn<(options?: ScrollIntoViewOptions | boolean) => void>
>

beforeEach(() => {
  section = document.createElement('section')
  section.id = 'mezzo'
  scrollIntoView = vi.fn<(options?: ScrollIntoViewOptions | boolean) => void>()
  section.scrollIntoView = scrollIntoView
  document.body.append(section)
})

afterEach(() => {
  section.remove()
  window.location.hash = ''
})

function renderLayout(isImmersive: boolean) {
  return renderHook(
    ({ immersive }) => {
      useAnchorAcrossLayouts(immersive, CHAPTER_IDS)
    },
    { initialProps: { immersive: isImmersive } },
  )
}

test('a switch of layout jumps again to the chapter in the address', () => {
  window.location.hash = '#mezzo'
  const { rerender } = renderLayout(false)
  rerender({ immersive: true })
  expect(scrollIntoView).toHaveBeenCalledOnce()
})

test('the first render leaves the position to the browser', () => {
  window.location.hash = '#mezzo'
  renderLayout(true)
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('an anchor that is not a chapter is left alone', () => {
  window.location.hash = '#altro'
  const { rerender } = renderLayout(false)
  rerender({ immersive: true })
  expect(scrollIntoView).not.toHaveBeenCalled()
})
