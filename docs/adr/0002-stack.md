# 0002 · Stack: TanStack Start, Convex, Astryx, Cloudflare

Status: accepted · 2026-11-24

- **App:** TanStack Start (React 19) + TanStack Router + TanStack Query. Scaffold with `npm create convex@latest -- -t tanstack-start` (see `docs/redesign/reference/`), using bun.
- **Backend:** Convex (database, queries/mutations/actions, crons, file metadata). Data reaches routes through `@convex-dev/react-query` (`convexQuery` + `ensureQueryData` in loaders, `useSuspenseQuery` in components) so pages render on the server and update live.
- **UI:** Astryx (`@astryxdesign/core`, theme extended from `@astryxdesign/theme-neutral`) with the official Tailwind v4 bridge; Astryx components first, token-backed Tailwind utilities second, no raw values. Follow `bunx astryx` workflow and `astryx doctor` before delivering.
- **Hosting:** Cloudflare Workers (TanStack Start Cloudflare target). **Media:** Cloudflare R2.
- **3D:** CSS 3D (`preserve-3d`) for the Block and slabs. React Three Fiber is out of scope for v1 (ADR 0007).
