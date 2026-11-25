// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { CmsOverviewPage } from './cms-overview-page'

afterEach(cleanup)

test('Panoramica is empty and says so', () => {
  render(<CmsOverviewPage />)

  expect(
    screen.getByRole('heading', { level: 1, name: 'Panoramica' }),
  ).toBeDefined()
  expect(
    screen.getByRole('heading', {
      level: 2,
      name: 'Ancora niente da mostrare',
    }),
  ).toBeDefined()
})
