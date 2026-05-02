# Portfolio V2

Personal portfolio for Anders Planck. Built with TanStack Start, React 19, Vite, Tailwind CSS v4, Bun, Vitest, and Biome.

## Requirements

- Bun
- Optional `GITHUB_TOKEN` for higher GitHub API rate limits in the server function that powers GitHub stats.

## Setup

```bash
bun install
cp .env.example .env.local
bun run dev
```

Local app: `http://localhost:3000`.

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run test
bun run check
bun run lint
bun run format
bunx tsc --noEmit
```

## Project Structure

- `src/routes` - TanStack Router pages and document metadata.
- `src/components` - portfolio UI components.
- `src/data` - portfolio, project, social, and CV content.
- `src/lib/github.ts` - GitHub profile fetch with static fallback.
- `public` - CV, icons, robots, sitemap, and image assets.

## Deployment

Vercel is configured through `vercel.json`.

Required build settings:

- Install command: `bun install`
- Build command: `bun run build`

## Quality Gates

CI runs:

```bash
bun run check
bunx tsc --noEmit
bun run test
bun run build
```
