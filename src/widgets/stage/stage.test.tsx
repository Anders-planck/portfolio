// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { DEFAULT_MOTION_KNOBS } from '../../features/motion/motion-knobs'
import { Stage } from './stage'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  stubIntersectionObserver,
  stubScreenWidth,
  TEST_CHAPTERS,
  TEST_FACES,
} from './stage.fixture'

beforeEach(() => {
  stubIntersectionObserver()
})

afterEach(cleanup)

function readHeadings() {
  return screen.getAllByRole('heading').map((heading) => heading.textContent)
}

test('on a wide screen with a mouse and motion the Stage is immersive', async () => {
  stubScreenWidth({ isWide: true })
  renderForReader(
    <Stage chapters={TEST_CHAPTERS} faces={TEST_FACES} />,
    ANIMATED_FINE_POINTER,
  )
  expect(await screen.findByRole('slider', { name: 'Blocco' })).toBeDefined()
  expect(screen.getByRole('list', { name: 'Capitoli' })).toBeDefined()
  expect(readHeadings()).toEqual([
    'Titolo di apertura',
    'Titolo di mezzo',
    'Titolo di chiusura',
  ])
})

test('with reduced motion every chapter is there, in a linear page', async () => {
  stubScreenWidth({ isWide: true })
  renderForReader(<Stage chapters={TEST_CHAPTERS} faces={TEST_FACES} />, {
    mode: 'reduced',
    pointer: 'fine',
    knobs: DEFAULT_MOTION_KNOBS,
  })
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Titolo di apertura',
    }),
  ).toBeDefined()
  expect(readHeadings()).toHaveLength(3)
  expect(screen.queryByRole('slider')).toBeNull()
  expect(screen.queryByRole('list', { name: 'Capitoli' })).toBeNull()
})

test('a narrow screen gets the linear page even with a mouse', async () => {
  stubScreenWidth({ isWide: false })
  renderForReader(
    <Stage chapters={TEST_CHAPTERS} faces={TEST_FACES} />,
    ANIMATED_FINE_POINTER,
  )
  expect(await screen.findAllByRole('heading')).toHaveLength(3)
  expect(screen.queryByRole('slider')).toBeNull()
})
