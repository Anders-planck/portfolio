// @vitest-environment happy-dom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { SiteFooter } from './site-footer'

afterEach(cleanup)

test('the footer links home and every section in the locale of the page', async () => {
  renderAtPath(<SiteFooter />, '/fr')
  expect(await screen.findByRole('contentinfo')).toBeDefined()
  expect(
    screen
      .getAllByRole('link')
      .map((link) => [link.textContent, link.getAttribute('href')]),
  ).toEqual([
    ['anders/planck', '/fr'],
    ['Projets', '/fr/lavori'],
    ['Notes', '/fr/note'],
    ['Parcours', '/fr/percorso'],
    ['CV · PDF', '/cv'],
  ])
})
