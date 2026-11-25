// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { createAppearance } from '../../entities/appearance/appearance.fixture'
import { MotionWrapper, stubReaderSettings } from './motion.fixture'
import { useMagnetic } from './use-magnetic'
import { useReveal } from './use-reveal'
import { useStagger } from './use-stagger'

vi.mock('../../entities/appearance/use-appearance', () => ({
  useAppearance: () => ({ appearance: createAppearance(), css: undefined }),
}))

class StubIntersectionObserver {
  observe(): void {
    // Nothing scrolls in these tests.
  }
  disconnect(): void {
    // Nothing to stop.
  }
}

/** Every element sits below the fold, so a reveal would hide it. */
function placeEverythingBelowTheFold() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, window.innerHeight + 100, 80, 40),
  )
}

function Blocks() {
  const revealRef = useReveal<HTMLElement>()
  const staggerRef = useStagger<HTMLUListElement>()
  const magneticRef = useMagnetic<HTMLButtonElement>()
  return (
    <>
      <section ref={revealRef} aria-label="reveal" />
      <ul ref={staggerRef} aria-label="stagger">
        <li>uno</li>
      </ul>
      <button ref={magneticRef} type="button">
        CV
      </button>
    </>
  )
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
  placeEverythingBelowTheFold()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('with motion allowed, blocks below the fold wait to come in', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: true })
  const { getByLabelText, getByRole } = render(<Blocks />, {
    wrapper: MotionWrapper,
  })
  expect(getByLabelText('reveal').style.opacity).toBe('0')
  expect(getByRole('listitem').style.opacity).toBe('0')
  expect(getByRole('button').style.transition).toContain('--ease-move')
})

test('with reduced motion every block is simply there and nothing is magnetic', () => {
  stubReaderSettings({ isReducedMotion: true, hasFinePointer: true })
  const { getByLabelText, getByRole } = render(<Blocks />, {
    wrapper: MotionWrapper,
  })
  expect(getByLabelText('reveal').style.opacity).toBe('')
  expect(getByRole('listitem').style.opacity).toBe('')
  expect(getByRole('button').style.transition).toBe('')
})

test('on touch blocks still come in, but nothing is magnetic', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: false })
  const { getByLabelText, getByRole } = render(<Blocks />, {
    wrapper: MotionWrapper,
  })
  expect(getByLabelText('reveal').style.opacity).toBe('0')
  expect(getByRole('button').style.transition).toBe('')
})
