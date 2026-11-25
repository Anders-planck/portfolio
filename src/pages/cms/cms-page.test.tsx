// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import type { ViewerState } from '../../features/owner-auth/use-viewer'
import { CmsPage } from './cms-page'

const viewer = vi.hoisted((): { current: ViewerState } => ({
  current: { status: 'loading' },
}))
vi.mock('../../features/owner-auth/use-viewer', () => ({
  useViewer: () => viewer.current,
}))
vi.mock('../../features/owner-auth/owner-auth-provider', () => ({
  OwnerAuthProvider: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('../../widgets/cms-access/cms-access-screen', () => ({
  CmsAccessScreen: ({ isSignedInAsOther }: { isSignedInAsOther: boolean }) => (
    <p>{isSignedInAsOther ? 'Accesso: altro account' : 'Accesso'}</p>
  ),
}))
vi.mock('../../widgets/cms-shell/cms-shell', () => ({
  CmsShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <p>Schermata del CMS</p>,
}))
vi.mock('../../shared/i18n/astryx-locale-provider', () => ({
  AstryxLocaleProvider: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('../../shared/router/router-link', () => ({ RouterLink: () => null }))

afterEach(cleanup)

function renderAs(state: ViewerState) {
  viewer.current = state
  render(<CmsPage />)
}

test('only the owner gets past Accesso to the CMS screens', () => {
  renderAs({ status: 'owner', login: 'anders', name: 'Anders' })

  expect(screen.getByText('Schermata del CMS')).toBeDefined()
})

test('a signed-out visitor sees Accesso', () => {
  renderAs({ status: 'signed-out' })

  expect(screen.getByText('Accesso')).toBeDefined()
  expect(screen.queryByText('Schermata del CMS')).toBeNull()
})

test('an account off the allowlist sees Accesso for another account', () => {
  renderAs({ status: 'not-owner' })

  expect(screen.getByText('Accesso: altro account')).toBeDefined()
})

test('while the viewer loads the CMS says so', () => {
  renderAs({ status: 'loading' })

  expect(screen.getByRole('status').textContent).toBe('Caricamento del CMS…')
})

test('a backend that does not answer has its own screen', () => {
  renderAs({ status: 'error' })

  expect(screen.getByText('Il CMS non risponde')).toBeDefined()
})
