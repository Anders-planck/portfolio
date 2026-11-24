---
name: coding-standards
description: The owner's binding coding standards for this repo. Use before writing, changing or reviewing code in src/, convex/ or e2e/.
---

# Coding standards

The rules live in [`CODING_STANDARDS.md`](../../../CODING_STANDARDS.md) at the repo root. Read it in full before the first edit of a session; this file is the checklist, not the rules.

## [lint] rules: run the tools

Tooling enforces every `[lint]` rule (TS-01…TS-06, ARC-01…03, ARC-08, LEN-01, NAME-02, DATA-02, UI-02, UI-03). Do not check them by eye; run:

```sh
bun run format        # Prettier writes; CI runs `bun run format:check`
bun run lint          # ESLint, --max-warnings 0
bun run typecheck     # app + convex tsconfigs
```

Never disable a rule to get green (FLOW-05); fix the cause. Configs: `eslint.config.ts`, `.prettierrc.json`, `tsconfig.json`, `convex/tsconfig.json`.

Folder map ARC-01 enforces (`eslint-plugin-boundaries`; a file outside it fails lint):

- `src/routes/` → `src/pages/<page>/` → `src/widgets/<widget>/` → `src/features/<feature>/` → `src/entities/<entity>/` → `src/shared/<segment>/`. Each imports only layers to its right, never a sibling of its own type.
- Any layer may import `convex/_generated/` and the theme (`src/styles/`, `src/themes/`, `src/astryx-themes.js`).
- `convex/` imports only `convex/` and `convex/_generated/`; `e2e/` only `src/shared/`.
- Environment values: only `src/shared/config/env.ts`. `console.warn`/`console.error`: only `src/shared/server/log.ts`.

## [review] rules: check each one

Before reporting done, walk the diff against each ID; open `CODING_STANDARDS.md` for the wording:

- Workflow: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
- Types: TS-07, TS-08
- Architecture: ARC-04, ARC-05, ARC-06, ARC-07
- Size and shape: LEN-02, LEN-03, LEN-04, LEN-05, LEN-06, LEN-07, LEN-08, LEN-09
- Naming: NAME-01, NAME-03, NAME-04, NAME-05, NAME-06, NAME-07
- Data and copy: DATA-01, DATA-03, DATA-04, DATA-05, DATA-06
- UI: UI-01, UI-04, UI-05
- Docs: DOC-01, DOC-02
- Tests: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06
- AI review: AI-01, AI-02, AI-03

Then run the `standards-reviewer` agent (`.claude/agents/standards-reviewer.md`) on the diff with its base ref, fix what it reports, and repeat until it reports no violations (AI-03).
