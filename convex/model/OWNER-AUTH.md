# Owner auth (ADR 0005)

Who may use the CMS, and how every CMS function checks it.

## Flow

1. `/cms` (client only) wraps the CMS in `OwnerAuthProvider` (`src/features/owner-auth`), Convex Auth's React provider on the app's one Convex client.
2. "Accedi con GitHub" starts `auth:startSignInWithGithub`; GitHub returns to the `authGithub` component's callback (`<site-url>/oauth/github/callback`), then to `/cms`, where the provider completes `auth:completeSignInWithGithub`.
3. Convex Auth calls the app's callbacks in `users.ts`: `admitGithubUser` (first sign-in) and `readmitGithubUser` (every sign-in). Both go through `admitOwner` (`owner.ts`), which refuses an id off `OWNER_GITHUB_IDS` with `ConvexError({ kind: 'not-owner' })`, so no user row nor session is made.
4. Every CMS query, mutation and action starts with `requireOwner(ctx)`: the session's user must exist and still be on the allowlist; otherwise it throws `signed-out` or `not-owner`. `users:getViewer` answers the same question without throwing, for the CMS shell.
5. `sessions.ts` lists the owner's sessions and revokes one or all of them (owner only; the CMS screen comes with ticket 15b).

## Files

- `convex.config.ts`: mounts `auth` (sessions) and `authGithub`, bound to `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.
- `auth.config.ts`: accepts Convex Auth's access tokens.
- `auth.ts`: session functions and the GitHub sign-in.
- `users.ts`, `model/users.ts`, `model/owner.ts`: users (role), the allowlist rule, `requireOwner`, `admitOwner`.
- `sessions.ts`, `model/sessions.ts`: list and revoke the owner's sessions.
- `e2e.ts`, `model/loopback.ts`, `model/secret.ts`: the test-only sign-in, its loopback guard and the constant-time secret check.
- `model/env.ts`: `OWNER_GITHUB_IDS`, `AUTH_REDIRECT_ORIGINS`, `E2E_SIGN_IN_SECRET`.

## Invariants

- One user per GitHub id, whichever method signed it in.
- The allowlist is read on every check: removing an id locks that account out at once, sessions included.
- The test-only sign-in is an internal mutation (no client can call it; Playwright runs it with `bunx convex run`, the local admin key) and, as defence in depth, works only with `E2E_SIGN_IN_SECRET` set and a loopback `CONVEX_CLOUD_URL`. It never changes an existing owner's profile. `owner.fixture.ts` uses it in `convex-test`.
- A deployment needs `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` to push. For the local anonymous backend, `scripts/local-convex/prepare-local-convex.ts` (run by Playwright and by `bun run dev`) creates the backend when none is linked and sets placeholders (plus the e2e values Playwright passes). It refuses a deploy key, a cloud `CONVEX_DEPLOYMENT` or a cloud link in `.env.local` (`--for-dev` leaves those alone instead), and gives the Convex CLI only an allowlisted environment.
