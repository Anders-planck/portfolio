// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { LinearStage } from './linear-stage'
import {
  ANIMATED_FINE_POINTER,
  renderForReader,
  TEST_CHAPTERS,
  TEST_FACES,
} from './stage.fixture'

afterEach(cleanup)

test('the linear Stage shows a still Block and every chapter in order', async () => {
  const { container } = renderForReader(
    <LinearStage chapters={TEST_CHAPTERS} faces={TEST_FACES} />,
    ANIMATED_FINE_POINTER,
  )
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Titolo di apertura',
    }),
  ).toBeDefined()
  expect(
    screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.id),
  ).toHaveLength(2)
  expect(
    Array.from(container.querySelectorAll('section')).map(
      (section) => section.id,
    ),
  ).toEqual(['inizio', 'mezzo', 'fine'])
  expect(screen.queryByRole('slider')).toBeNull()
  expect(
    container.querySelector('[aria-hidden="true"]')?.textContent,
  ).toContain('Nord')
})
