// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteHeader } from './site-header'

afterEach(cleanup)

test('the sections link in the locale of the page, the current one marked', async () => {
  renderAtPath(<SiteHeader />, '/en/lavori/bussola')
  const work = await screen.findByRole('link', { name: 'Work' })
  expect(work.getAttribute('href')).toBe('/en/lavori')
  expect(work.getAttribute('aria-current')).toBe('page')
  expect(
    screen.getByRole('link', { name: 'Notes' }).getAttribute('aria-current'),
  ).toBeNull()
  expect(
    screen.getByRole('link', { name: 'anders/planck' }).getAttribute('href'),
  ).toBe('/en')
  expect(
    screen.getByRole('link', { name: 'CV · PDF' }).getAttribute('href'),
  ).toBe('/en/cv')
})
