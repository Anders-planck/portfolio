import { setupGithub } from '@convex-dev/auth/methods/github/server'
import { setupConvexAuth } from '@convex-dev/auth/server'

import { components, internal } from './_generated/api'
import { readAuthRedirectOrigins } from './model/env'

/**
 * Convex Auth with GitHub (ADR 0005). The session functions the client
 * provider needs, and the GitHub sign-in. Who may sign in is decided by the
 * user callbacks in `users.ts`; sessions live in the `auth` component.
 */
const auth = setupConvexAuth({ component: components.auth })

export const { signOut, refreshSession, isAuthenticated } = auth

export const { startSignInWithGithub, completeSignInWithGithub } = setupGithub(
  auth,
  {
    component: components.authGithub,
    allowedRedirectOrigins: readAuthRedirectOrigins(),
  },
).attachUserCallbacks({
  createUser: internal.users.admitGithubUser,
  onSignIn: internal.users.readmitGithubUser,
})
