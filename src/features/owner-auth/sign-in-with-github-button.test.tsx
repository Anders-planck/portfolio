// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SignInWithGithubButton } from './sign-in-with-github-button'

const signIn = vi.hoisted(() => vi.fn())
vi.mock('@convex-dev/auth/methods/github/react', () => ({
  useSignInWithGithub: () => ({ signIn }),
}))

afterEach(() => {
  cleanup()
  signIn.mockReset()
})

test('starts the GitHub sign-in', async () => {
  signIn.mockResolvedValue({ status: 'redirect', redirect: new URL('https://github.com') })
  render(<SignInWithGithubButton />)

  fireEvent.click(screen.getByRole('button', { name: 'Accedi con GitHub' }))

  await vi.waitFor(() => {
    expect(signIn).toHaveBeenCalledOnce()
  })
  expect(screen.queryByText('Accesso non riuscito: riprova.')).toBeNull()
})

test('a sign-in that cannot start says so', async () => {
  signIn.mockResolvedValue({
    status: 'error',
    userError: { error: 'OTHER_ERROR', cause: new Error('refused') },
  })
  render(<SignInWithGithubButton />)

  fireEvent.click(screen.getByRole('button', { name: 'Accedi con GitHub' }))

  expect(await screen.findByText('Accesso non riuscito: riprova.')).toBeDefined()
})
