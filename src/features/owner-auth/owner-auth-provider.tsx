import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { useConvex } from 'convex/react'
import type { ReactNode } from 'react'

import { api } from '../../../convex/_generated/api'

const OWNER_AUTH_API = {
  refreshSession: api.auth.refreshSession,
  signOut: api.auth.signOut,
  isAuthenticated: api.auth.isAuthenticated,
}

/**
 * Convex Auth for the CMS only (ADR 0005): it signs the app's one Convex
 * client in, so the public site never loads the auth client. Tokens live in
 * `localStorage`, which is why the CMS renders on the client only.
 */
export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const client = useConvex()
  return (
    <ConvexAuthProvider client={client} api={OWNER_AUTH_API}>
      {children}
    </ConvexAuthProvider>
  )
}
