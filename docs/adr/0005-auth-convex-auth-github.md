# 0005 · CMS access: Convex Auth with GitHub, owner allowlist

Status: accepted · 2026-11-24

The CMS uses Convex Auth with the GitHub OAuth provider. An allowlist of GitHub user ids (env `OWNER_GITHUB_IDS`) defines the owner; every CMS query, mutation and action starts with `requireOwner`. Single user for v1; the users table keeps a role field so roles can come later. Sessions are listed and revocable in the CMS.

Amended 2026-11-25 (ticket 04):

- Convex Auth 2 is a component (`auth`, plus `authGithub` for GitHub; `convex/convex.config.ts`), so sessions live in the component; the app owns `users` (`role: 'owner'`, `githubId`).
- The allowlist is checked at sign-in (the GitHub `createUser` and `onSignIn` callbacks refuse an id off it, so no user row nor session is made) and again on every CMS call (`requireOwner`), so removing an id locks the account out at once.
- Env: `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` (required by `convex.config.ts`: a deployment without them does not push), `OWNER_GITHUB_IDS`, `AUTH_REDIRECT_ORIGINS` (origins GitHub may send the owner back to; unset refuses every GitHub sign-in).
- A test-only sign-in (`convex/e2e.ts`) lets Playwright sign in as the owner. It works only when `E2E_SIGN_IN_SECRET` is set **and** the deployment's own URL is a loopback address, so no cloud deployment can enable it.
