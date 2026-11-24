<claude-mem-context>
# Memory Context

# [portfolio] recent context, 2026-05-02 11:46pm GMT+2

No previous sessions found.
</claude-mem-context>

<!-- ASTRYX:START -->
Astryx v0.7.17 · 174 components
CLI: run every command as `bunx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx component <Name>` to read props before using one; `astryx template <Block>` prints a block example to read for a part it lacks. Astryx names differ from other libraries: buttons, badges, tokens and tabs take their text in `label` (Text, Heading and Link take children), booleans start with `is` or `has` (`isOpen`, `isDisabled`), and every input takes `value` and `onChange`.
Changing an existing page? Keep it: skip step 2 and add components inside its sections; read a block example when it helps.
Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then Tailwind utilities backed by tokens. No raw hex/px.
- THEMES: palettes and custom colors go through the theme, never :root overrides; so does a denser or roomier app (`editor set <name> spacing tight`), never gap and padding changes page by page. A change to one kind of part (the sidebar, its selected item, the gaps in a form) is a theme change too, not props on one page: `editor how "<ask>"` names the `set … --on <part>` line. No app yet: `astryx experimental theme preview app <dir>` makes a starter app that shows the theme. To make or change a theme (colors, fonts, corners, spacing, a look from a picture), prefer the experimental theme editor over hand-written theme files: `astryx experimental theme editor new <name> --like neutral`, then `editor set <name> <thing> <value>` or `editor how "<what you want>"`; wire it with `astryx theme add <name>`; after each change look at it with `astryx experimental theme editor show <name> --png` (takes pictures of real components) and open the PNGs it writes; a theme change is not done until you have looked at the pictures. In code, extend an imported theme to customize it; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded/arbitrary value (bg-[#fff], p-[13px]) with the component or a token-backed utility.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
To remove this block, run `astryx init --remove-agents`, which removes it from the agent files at the project root and in the folder you run it in; from any other file it leaves, delete everything from ASTRYX:START to ASTRYX:END.
<!-- ASTRYX:END -->

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`Anders-planck/portfolio`, via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Project

Portfolio v3: TanStack Start (React 19) + Convex + Astryx, served by Cloudflare Workers. Before any work read `GLOSSARY.md`, `docs/adr/`, then `docs/redesign/PLAN.md`; its "Design resolutions" override the mockups in `docs/redesign/design/`. Numbers never appear as free text (ADR 0004).

Layout: `src/routes/` (file routes; `routeTree.gen.ts` is generated), `src/router.tsx` (Convex + React Query wiring), `src/styles/globals.css` (cascade-layer order; must stay the first stylesheet), `convex/` (backend; `_generated/` is generated, commit it), `themes/portfolio/` (Astryx theme source; change it only through `bunx astryx experimental theme editor`), `src/themes/portfolio/` and `src/astryx-themes.js` (app copy the editor generates; never hand-edit), `e2e/` (Playwright), `scripts/wizard/` (owner-only steps).

Commands (bun only):
- `bun run dev` runs Convex and Vite. Without a Convex login use `CONVEX_AGENT_MODE=anonymous bun run dev:convex` plus `bun run dev:web`.
- `bun run typecheck` runs TypeScript 7 (`@typescript/native`); the `typescript` package is TS 6 for tools that need its API.
- Before pushing, all must pass: `bun run lint`, `bun run typecheck`, `bun run test`, `bun run e2e`, then `bun run build && bun run doctor`.

Data in routes: `convexQuery` + `context.queryClient.ensureQueryData` in the loader (server render), `useSuspenseQuery` in the component (live updates). Test Convex functions with `convex-test` next to them (`convex/*.test.ts`).

Owner-only steps (accounts, logins, secrets, DNS): write a `wizard` script under `scripts/wizard/` and list it in `docs/redesign/OWNER-STEPS.md`. Never ask for, print or commit secrets.
