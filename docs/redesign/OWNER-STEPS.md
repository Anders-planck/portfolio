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

### Ticket 04 · GitHub OAuth app for the CMS sign-in (dev)

Run `scripts/wizard/github-oauth.sh` from the repo root of the checkout whose `.env.local` links the cloud dev deployment. It:

1. Reads the dev deployment's HTTP actions URL and shows the callback URL, `https://<deployment>.convex.site/oauth/github/callback`.
2. Opens GitHub → Settings → Developer settings → OAuth Apps → New, with the name, homepage (`http://localhost:3000`) and callback to fill in.
3. Asks for the Client ID and the client secret (hidden) and sets `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` on the dev deployment with `bunx convex env set` (the secret through stdin; nothing is written to disk).

`convex/convex.config.ts` requires both values: until they are set, pushes to the dev deployment fail. The other values of the sign-in (`OWNER_GITHUB_IDS`, `AUTH_REDIRECT_ORIGINS`) are set by the coordinating session, not by this wizard. Production gets its own OAuth app (its callback is the production deployment's URL) with the production deployment's ticket.

### Ticket 12 · R2 bucket and keys for Media (dev)

Run `scripts/wizard/r2-media.sh` from the repo root of the checkout whose `.env.local` links the cloud dev deployment, signed in to the personal Cloudflare account. It walks you through:

1. Creating the bucket (`portfolio-media`) in R2.
2. Copying the account ID (not secret).
3. A public domain for the bucket: a custom domain such as `media.<your domain>` (needed for Image transformations), or the r2.dev development URL meanwhile.
4. The bucket's CORS rule (printed by the wizard): `PUT`, `GET`, `HEAD` with header `Content-Type`, from `http://localhost:3000` and `https://portfolio.anders-jipwouo.workers.dev` (add the production origin later).
5. An R2 API token with **Object Read & Write on this bucket only**; the Access Key ID and the Secret Access Key go straight to the Convex env (`R2_ACCOUNT_ID`, `R2_BUCKET`, `MEDIA_PUBLIC_ORIGIN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`; the secret through stdin, nothing on disk).
6. Later, with the production domain: Image transformations on that zone (Images → Transformations → Enable), its sources allowing the media domain, and `IMAGE_TRANSFORM_ORIGIN` (e.g. `https://example.com`). Until then images are served as uploaded.

The five storage values are all-or-none: with only some set, Media refuses to load. Production gets its own token (and may share the bucket or get its own) with the production deployment's ticket.

## Later tickets

- **`SITE_ORIGIN` (with the production domain).** Set the Worker var `SITE_ORIGIN` to the bare production origin (e.g. `https://example.com`, no path or trailing slash), in `wrangler.jsonc` `vars` or the Cloudflare dashboard. Until it is set, canonical, hreflang and `og:url` use the request's own origin and every page carries `noindex`; once set, they point at it and only that host is indexed (`*.workers.dev` previews stay `noindex`). Read by `src/shared/config/env.ts` (ticket 06).

- Convex production deployment and deploy key; production GitHub OAuth app; production R2 token and `IMAGE_TRANSFORM_ORIGIN`; Convex env vars (`docs/redesign/PLAN.md` → Environments and secrets); DNS cutover. Each gets its wizard in the ticket that needs it.
