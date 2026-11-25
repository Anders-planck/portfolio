// @vitest-environment happy-dom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { astryxCatalogQueryOptions } from '../../shared/i18n/astryx-catalog-query-options'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { LanguageMenu } from './language-menu'

afterEach(cleanup)

test('the language menu opens the same page in the chosen locale', async () => {
  const { router, queryClient } = renderAtPath(
    <LanguageMenu />,
    '/en/lavori?vista=lista',
  )
  fireEvent.click(await screen.findByRole('button', { name: 'Language: EN' }))
  const english = await screen.findByRole('menuitemradio', { name: /English/ })
  expect(english.getAttribute('aria-checked')).toBe('true')
  expect(screen.getByText('Deutsch').getAttribute('lang')).toBe('de')
  // Opening the menu fetched the other locales' Astryx words already.
  await waitFor(() => {
    expect(
      queryClient.getQueryData(astryxCatalogQueryOptions('de').queryKey),
    ).toBeDefined()
  })

  fireEvent.click(screen.getByRole('menuitemradio', { name: /Deutsch/ }))
  await waitFor(() => {
    expect(router.state.location.href).toBe('/de/lavori?vista=lista')
  })
})
