// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { PageErrorPage } from './page-error-page'

afterEach(cleanup)

test('a page that failed to load says so in its locale and can try again', async () => {
  const { router } = renderAtPath(<PageErrorPage />, '/fr/lavori')
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Quelque chose n’a pas fonctionné.',
    }),
  ).toBeDefined()

  const invalidate = vi.spyOn(router, 'invalidate')
  fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
  expect(invalidate).toHaveBeenCalledOnce()
})
