# Owner steps

Steps only the owner can do (accounts, logins, secrets, DNS). Each one has a wizard under `scripts/wizard/`; run it from the repo root. Agents never handle the secrets these steps produce.

## Pending

### Ticket 01 · Convex cloud dev deployment and Workers preview

Run `scripts/wizard/preview-deploy.sh`. It:

1. Creates the Convex project `portafoglio` with a cloud dev deployment (`bunx convex dev --once --configure new --project portafoglio --dev-deployment cloud`) and writes `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` to `.env.local`.
2. Logs Wrangler in to your Cloudflare account (`bunx wrangler login`).
3. Builds and deploys the Worker `portfolio` to workers.dev (`bun run deploy`) and asks for the preview URL.

Until then, development and CI use the anonymous local Convex backend (`CONVEX_AGENT_MODE=anonymous bunx convex dev`), which needs no account.

Preview URL: _not deployed yet_

## Later tickets

- Convex production deployment and deploy key; GitHub OAuth app; R2 bucket and keys; Convex env vars (`docs/redesign/PLAN.md` → Environments and secrets); DNS cutover. Each gets its wizard in the ticket that needs it.
