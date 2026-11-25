// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { CmsShell } from './cms-shell'

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/cms/profilo' }),
}))
vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}))

afterEach(cleanup)

test('the shell groups the CMS in Contenuti, Sito and Qualità around the screen', () => {
  render(
    <CmsShell>
      <p>Schermata</p>
    </CmsShell>,
  )

  for (const group of ['Contenuti', 'Sito', 'Qualità']) {
    expect(screen.getByText(group)).toBeDefined()
  }
  expect(screen.getByRole('main').textContent).toContain('Schermata')
  expect(screen.getByRole('button', { name: 'Esci' })).toBeDefined()
})

test('the current screen is the selected item', () => {
  render(
    <CmsShell>
      <p>Schermata</p>
    </CmsShell>,
  )

  expect(
    screen.getByRole('link', { name: 'Profilo' }).getAttribute('aria-current'),
  ).toBe('page')
  expect(
    screen.getByRole('link', { name: 'Panoramica' }).getAttribute('aria-current'),
  ).toBeNull()
})
