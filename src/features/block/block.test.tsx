// @vitest-environment happy-dom
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { Block } from './block'
import { TEST_FACES, waitForFrames } from './block.fixture'

afterEach(cleanup)

const FACING_FRONT = () => ({ yawDeg: 0, scale: 1 })

test('without a scroll pose the Block is a still, decorative picture', async () => {
  const { container } = renderAtPath(<Block faces={TEST_FACES} />, '/')
  await screen.findByText('Nord')
  expect(screen.queryByRole('slider')).toBeNull()
  expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
})

test('a driven Block is a slider whose value is the face at the front', async () => {
  renderAtPath(<Block faces={TEST_FACES} readScrollPose={FACING_FRONT} />, '/')
  const block = await screen.findByRole('slider', { name: 'Blocco' })
  expect(block.getAttribute('aria-valuetext')).toBe('01 · Nord')
  expect(block.getAttribute('aria-valuemax')).toBe('4')
  expect(block.getAttribute('data-cursor')).toBe('Trascina')
})

test('the arrow keys bring the next and previous faces to the front', async () => {
  renderAtPath(<Block faces={TEST_FACES} readScrollPose={FACING_FRONT} />, '/')
  const block = await screen.findByRole('slider', { name: 'Blocco' })

  fireEvent.keyDown(block, { key: 'ArrowRight' })
  await act(waitForFrames)
  expect(block.getAttribute('aria-valuetext')).toBe('02 · Est')

  fireEvent.keyDown(block, { key: 'ArrowLeft' })
  fireEvent.keyDown(block, { key: 'ArrowLeft' })
  await act(waitForFrames)
  expect(block.getAttribute('aria-valuetext')).toBe('04 · Ovest')
})

test('Home and End bring the first and last faces to the front', async () => {
  renderAtPath(<Block faces={TEST_FACES} readScrollPose={FACING_FRONT} />, '/')
  const block = await screen.findByRole('slider', { name: 'Blocco' })

  fireEvent.keyDown(block, { key: 'End' })
  await act(waitForFrames)
  expect(block.getAttribute('aria-valuetext')).toBe('04 · Ovest')
  fireEvent.keyDown(block, { key: 'Home' })
  await act(waitForFrames)
  expect(block.getAttribute('aria-valuetext')).toBe('01 · Nord')
})

test('keys with a modifier and Up/Down are left to the browser', async () => {
  renderAtPath(<Block faces={TEST_FACES} readScrollPose={FACING_FRONT} />, '/')
  const block = await screen.findByRole('slider', { name: 'Blocco' })

  const shortcuts = [
    { key: 'ArrowRight', shiftKey: true },
    { key: 'ArrowLeft', altKey: true },
    { key: 'ArrowRight', ctrlKey: true },
    { key: 'ArrowLeft', metaKey: true },
    { key: 'ArrowDown' },
  ]
  const handled = shortcuts.map(
    (shortcut) => !fireEvent.keyDown(block, shortcut),
  )
  await act(waitForFrames)
  expect(handled).toEqual([false, false, false, false, false])
  expect(block.getAttribute('aria-valuetext')).toBe('01 · Nord')
})
