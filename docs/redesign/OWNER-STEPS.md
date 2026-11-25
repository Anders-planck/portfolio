# Owner steps

Steps only the owner can do (accounts, logins, secrets, DNS). Each one has a wizard under `scripts/wizard/`; run it from the repo root. Agents never handle the secrets these steps produce.

## Done

### Ticket 01 · Convex cloud dev deployment and Workers preview (done 2026-11-24)

Convex project `portafoglio` (dev deployment in eu-west-1) and Worker `portfolio` on the personal Cloudflare account (`account_id` pinned in `wrangler.jsonc`, since the owner has two accounts).

Run `scripts/wizard/preview-deploy.sh`. It:

1. Creates the Convex project `portafoglio` with a cloud dev deployment (`bunx convex dev --once --configure new --project portafoglio --dev-deployment cloud`) and writes `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` to `.env.local`.
2. Logs Wrangler in to your Cloudflare account (`bunx wrangler login`).
3. Builds and deploys the Worker `portfolio` to workers.dev (`bun run deploy`) and asks for the preview URL.

Until then, development and CI use the anonymous local Convex backend (`CONVEX_AGENT_MODE=anonymous bunx convex dev`), which needs no account.

Preview URL: https://portfolio.anders-jipwouo.workers.dev

## Pending

## Later tickets

- **`SITE_ORIGIN` (with the production domain).** Set the Worker var `SITE_ORIGIN` to the bare production origin (e.g. `https://example.com`, no path or trailing slash), in `wrangler.jsonc` `vars` or the Cloudflare dashboard. Until it is set, canonical, hreflang and `og:url` use the request's own origin and every page carries `noindex`; once set, they point at it and only that host is indexed (`*.workers.dev` previews stay `noindex`). Read by `src/shared/config/env.ts` (ticket 06).

- Convex production deployment and deploy key; GitHub OAuth app; R2 bucket and keys; Convex env vars (`docs/redesign/PLAN.md` → Environments and secrets); DNS cutover. Each gets its wizard in the ticket that needs it.
