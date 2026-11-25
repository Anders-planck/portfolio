import { useQuery } from '@tanstack/react-query'
import { useConvexAuth } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

type Viewer = FunctionReturnType<typeof api.users.getViewer>

/** Who is using the CMS, or why that is not known yet. */
export type ViewerState = { status: 'loading' } | { status: 'error' } | Viewer

const viewerQueryOptions = convexQueryOptions(api.users.getViewer, {})

/**
 * The viewer, read once the auth client has settled: before that the query
 * would run without the stored session and report a signed-out owner.
 */
export function useViewer(): ViewerState {
  const { isLoading: isAuthLoading } = useConvexAuth()
  const viewer = useQuery({ ...viewerQueryOptions, enabled: !isAuthLoading })
  if (viewer.isError) {
    return { status: 'error' }
  }
  if (isAuthLoading || viewer.isPending) {
    return { status: 'loading' }
  }
  return viewer.data
}
