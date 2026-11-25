import { ConvexError } from 'convex/values'
import { Component, type ReactNode } from 'react'

/**
 * For component tests of `useBackendRefusal`: an error boundary that shows
 * `refused: <kind>` for a caught `ConvexError` and lets anything else through.
 */
export class RefusalBoundary extends Component<
  { children: ReactNode },
  { refusalKind: string | null }
> {
  override state: { refusalKind: string | null } = { refusalKind: null }

  static getDerivedStateFromError(error: unknown) {
    if (!(error instanceof ConvexError)) {
      throw error
    }
    const data: unknown = error.data
    const kind =
      typeof data === 'object' && data !== null && 'kind' in data
        ? String(data.kind)
        : 'unknown'
    return { refusalKind: kind }
  }

  override render() {
    const { refusalKind } = this.state
    return refusalKind === null
      ? this.props.children
      : `refused: ${refusalKind}`
  }
}
