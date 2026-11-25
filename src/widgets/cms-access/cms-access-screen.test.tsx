// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { ConvexError } from 'convex/values'
import { afterEach, expect, test, vi } from 'vitest'

import { CmsAccessScreen } from './cms-access-screen'

const oauth = vi.hoisted((): { flowError: unknown } => ({ flowError: null }))
vi.mock('@convex-dev/auth/methods/github/react', () => ({
  useOauth: () => oauth,
  useSignInWithGithub: () => ({ signIn: vi.fn() }),
}))
vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}))

afterEach(() => {
  cleanup()
  oauth.flowError = null
})

test('Accesso offers "Accedi con GitHub" and no repo wording', () => {
  render(<CmsAccessScreen isSignedInAsOther={false} />)

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Accedi per modificare il sito',
    }),
  ).toBeDefined()
  expect(
    screen.getByRole('button', { name: 'Accedi con GitHub' }),
  ).toBeDefined()
  expect(screen.queryByText(/repo|ramo|commit/i)).toBeNull()
})

test('an account the allowlist refused at sign-in is told so', () => {
  oauth.flowError = {
    error: 'OTHER_ERROR',
    cause: new ConvexError({ kind: 'not-owner' }),
  }
  render(<CmsAccessScreen isSignedInAsOther={false} />)

  expect(
    screen.getByText('Questo account non può entrare nel CMS'),
  ).toBeDefined()
})

test('a session of an account no longer allowed can only sign out', () => {
  render(<CmsAccessScreen isSignedInAsOther />)

  expect(
    screen.getByText('Questo account non può entrare nel CMS'),
  ).toBeDefined()
  expect(screen.getByRole('button', { name: 'Esci' })).toBeDefined()
  expect(screen.queryByRole('button', { name: 'Accedi con GitHub' })).toBeNull()
})
