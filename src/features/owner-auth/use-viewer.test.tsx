// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { FunctionReturnType } from 'convex/server'
import type { ReactNode } from 'react'
import { beforeEach, expect, test, vi } from 'vitest'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import { useViewer } from './use-viewer'

const authState = vi.hoisted(() => ({ isLoading: false }))
vi.mock('convex/react', () => ({ useConvexAuth: () => authState }))

const VIEWER_KEY = convexQueryOptions(api.users.getViewer, {}).queryKey

beforeEach(() => {
  authState.isLoading = false
})

type Viewer = FunctionReturnType<typeof api.users.getViewer>

function renderViewer(viewer: Viewer) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClient.setQueryData(VIEWER_KEY, viewer)
  return renderHook(() => useViewer(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

test('while the auth client settles the viewer is loading, not signed out', () => {
  authState.isLoading = true
  const { result } = renderViewer({ status: 'signed-out' })

  expect(result.current).toEqual({ status: 'loading' })
})

test('once settled, the viewer is what the backend says', () => {
  const { result } = renderViewer({
    status: 'owner',
    login: 'anders',
    name: 'Anders',
  })

  expect(result.current).toEqual({
    status: 'owner',
    login: 'anders',
    name: 'Anders',
  })
})
