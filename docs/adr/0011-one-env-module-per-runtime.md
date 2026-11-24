# 0011 · One env config module per runtime

Status: accepted · 2026-11-24

ARC-08 says environment values are read in one config module. The app and the Convex backend are two runtimes with two environments: the app reads build and Worker values (`VITE_CONVEX_URL`) in `src/shared/config/env.ts`, and Convex reads deployment env values set with `bunx convex env set` (first `PREVIEW_TOKEN_SECRET`, later `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `RESERVED_TERMS_SALT`, …) in `convex/model/env.ts`. Convex code cannot import `src/` (ARC-01) and its values are not in the app's environment, so the backend has its own module. Each runtime still has exactly one, validated there, and `eslint.config.ts` allows `process.env` / `import.meta.env` only in these two files.
