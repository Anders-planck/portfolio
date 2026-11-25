// @vitest-environment happy-dom
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { Stage } from './stage'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  stubIntersectionObserver,
  stubScreenWidth,
  TEST_CHAPTERS,
  TEST_FACES,
} from './stage.fixture'

let intersections: ReturnType<typeof stubIntersectionObserver>
const scrollIntoView =
  vi.fn<(options?: ScrollIntoViewOptions | boolean) => void>()

beforeEach(() => {
  intersections = stubIntersectionObserver()
  scrollIntoView.mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(cleanup)

function renderStage() {
  return renderForReader(
    <Stage chapters={TEST_CHAPTERS} faces={TEST_FACES} />,
    ANIMATED_FINE_POINTER,
  )
}

test('every chapter is a section with its anchor and heading, in order', async () => {
  stubScreenWidth({ isWide: false })
  const { container } = renderStage()
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Titolo di apertura',
    }),
  ).toBeDefined()
  expect(
    Array.from(container.querySelectorAll('section')).map(
      (section) => section.id,
    ),
  ).toEqual(['inizio', 'mezzo', 'fine'])
})

test('outside the immersive layout the Block is a still picture', async () => {
  stubScreenWidth({ isWide: false })
  renderStage()
  await screen.findAllByRole('heading')
  expect(screen.queryByRole('slider')).toBeNull()
})

test('in the immersive layout the Block is driven', async () => {
  stubScreenWidth({ isWide: true })
  renderStage()
  expect(await screen.findByRole('slider', { name: 'Blocco' })).toBeDefined()
})

test('the chapter under the middle line is the active one', async () => {
  stubScreenWidth({ isWide: true })
  renderStage()
  const navigation = await screen.findByRole('group', { name: 'Capitolo' })
  expect(navigation.textContent).toContain('00 / 02 · Inizio')
  const middle = document.getElementById('mezzo')
  act(() => {
    if (middle !== null) {
      intersections.reportActive(middle)
    }
  })
  expect(navigation.textContent).toContain('01 / 02 · Mezzo')
})

test('next scrolls to the following chapter and puts it in the address', async () => {
  stubScreenWidth({ isWide: true })
  const { router } = renderStage()
  fireEvent.click(
    await screen.findByRole('button', { name: 'Capitolo successivo' }),
  )
  expect(scrollIntoView).toHaveBeenCalledOnce()
  await vi.waitFor(() => {
    expect(router.state.location.hash).toBe('mezzo')
  })
})

test('a second next while the first is on its way goes one chapter further', async () => {
  stubScreenWidth({ isWide: true })
  const { router } = renderStage()
  const next = await screen.findByRole('button', {
    name: 'Capitolo successivo',
  })
  fireEvent.click(next)
  fireEvent.click(next)
  await vi.waitFor(() => {
    expect(router.state.location.hash).toBe('fine')
  })
})
