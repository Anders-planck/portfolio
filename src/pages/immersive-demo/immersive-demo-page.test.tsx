// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { ImmersiveDemoPage } from './immersive-demo-page'

afterEach(cleanup)

test('the demo says it is a demo and runs five placeholder chapters', async () => {
  renderAtPath(<ImmersiveDemoPage />, '/en/demo')
  expect(
    await screen.findByText(
      'Demo page: the copy is placeholder text and describes no real work.',
    ),
  ).toBeDefined()
  expect(
    screen.getByRole('heading', { level: 1, name: 'Immersive engine demo' }),
  ).toBeDefined()
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4)
})
