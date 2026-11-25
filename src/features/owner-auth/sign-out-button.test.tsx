// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SignOutButton } from './sign-out-button'

const signOut = vi.hoisted(() => vi.fn())
vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut }),
}))

afterEach(cleanup)

test('ends the session', async () => {
  signOut.mockResolvedValue(undefined)
  render(<SignOutButton />)

  fireEvent.click(screen.getByRole('button', { name: 'Esci' }))

  await vi.waitFor(() => {
    expect(signOut).toHaveBeenCalledOnce()
  })
})
