// @vitest-environment happy-dom
import { renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { createAppearance } from '../../entities/appearance/appearance.fixture'
import { stubReaderSettings } from './motion.fixture'
import { DEFAULT_MOTION_KNOBS } from './motion-knobs'
import { MotionProvider } from './motion-provider'
import { canFollowPointer, useMotion } from './use-motion'

// The published params come live from Convex; here each test sets them.
vi.mock('../../entities/appearance/use-appearance', () => ({
  useAppearance: () => ({
    appearance: createAppearance({ motion: { tempo: 1.5 } }),
    css: undefined,
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

test('with a mouse and motion allowed, pointer effects run at the published tempo', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: true })
  const { result } = renderHook(useMotion, { wrapper: MotionProvider })
  expect(result.current.mode).toBe('animated')
  expect(result.current.pointer).toBe('fine')
  expect(canFollowPointer(result.current)).toBe(true)
  expect(result.current.knobs.staggerDelayMs).toBe(
    DEFAULT_MOTION_KNOBS.staggerDelayMs * 1.5,
  )
})

test('reduced motion wins over the published params', () => {
  stubReaderSettings({ isReducedMotion: true, hasFinePointer: true })
  const { result } = renderHook(useMotion, { wrapper: MotionProvider })
  expect(result.current.mode).toBe('reduced')
  expect(canFollowPointer(result.current)).toBe(false)
})

test('on touch nothing follows the pointer', () => {
  stubReaderSettings({ isReducedMotion: false, hasFinePointer: false })
  const { result } = renderHook(useMotion, { wrapper: MotionProvider })
  expect(result.current.pointer).toBe('coarse')
  expect(canFollowPointer(result.current)).toBe(false)
})

test('outside the provider nothing moves', () => {
  const { result } = renderHook(useMotion)
  expect(result.current.mode).toBe('reduced')
  expect(canFollowPointer(result.current)).toBe(false)
})
