// @vitest-environment happy-dom
import { cleanup, render, screen } from '@testing-library/react'
import { type FunctionReference, getFunctionName } from 'convex/server'
import type { ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'

import { OwnerAuthProvider } from './owner-auth-provider'

const appClient = vi.hoisted(() => ({ url: 'http://127.0.0.1:3210' }))
type SessionFunctions = Record<string, FunctionReference<'query' | 'mutation'>>
const providerProps = vi.hoisted(() => ({
  current: null as null | { client: unknown; api: SessionFunctions },
}))
vi.mock('convex/react', () => ({ useConvex: () => appClient }))
vi.mock('@convex-dev/auth/react', () => ({
  ConvexAuthProvider: ({
    children,
    ...props
  }: {
    children: ReactNode
    client: unknown
    api: SessionFunctions
  }) => {
    providerProps.current = props
    return children
  },
}))

afterEach(cleanup)

test("signs the app's own Convex client in with the auth session functions", () => {
  render(
    <OwnerAuthProvider>
      <p>CMS</p>
    </OwnerAuthProvider>,
  )

  expect(screen.getByText('CMS')).toBeDefined()
  expect(providerProps.current?.client).toBe(appClient)
  const functionNames = Object.values(providerProps.current?.api ?? {}).map(
    (reference) => getFunctionName(reference),
  )
  expect(functionNames).toEqual([
    'auth:refreshSession',
    'auth:signOut',
    'auth:isAuthenticated',
  ])
})
