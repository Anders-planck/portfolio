// @vitest-environment happy-dom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { LanguageMenu } from './language-menu'

afterEach(cleanup)

test('the language menu opens the same page in the chosen locale', async () => {
  const { router } = renderAtPath(<LanguageMenu />, '/en/lavori?vista=lista')
  fireEvent.click(await screen.findByRole('button', { name: 'Language: EN' }))
  const english = await screen.findByRole('menuitemradio', { name: /English/ })
  expect(english.getAttribute('aria-checked')).toBe('true')

  fireEvent.click(screen.getByRole('menuitemradio', { name: /Deutsch/ }))
  await waitFor(() => {
    expect(router.state.location.href).toBe('/de/lavori?vista=lista')
  })
})
