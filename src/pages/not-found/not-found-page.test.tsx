// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NotFoundPage } from './not-found-page'

afterEach(cleanup)

test('the 404 page speaks the locale of the address and links back in it', async () => {
  renderAtPath(<NotFoundPage />, '/de/gibt-es-nicht')
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Diese Seite gibt es nicht, oder nicht mehr.',
    }),
  ).toBeDefined()
  expect(
    screen.getByRole('link', { name: 'Zur Startseite' }).getAttribute('href'),
  ).toBe('/de')
  expect(
    screen.getByRole('link', { name: 'Zu den Projekten' }).getAttribute('href'),
  ).toBe('/de/lavori')
})
