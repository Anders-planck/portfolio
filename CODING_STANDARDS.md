# Coding standards

These rules bind every change in `src/`, `convex/` and `e2e/`. They are the owner's own rules, the ones used in every repository the owner leads, adapted to this stack (TanStack Start, Convex, Astryx, Cloudflare Workers). Each rule is tagged:

- **[lint]**: ESLint, Prettier or TypeScript enforce it, and `bun run lint` / `bun run typecheck` fail when it is broken;
- **[review]**: the author and the reviewer check it.

Code identifiers are in English and use the terms of `GLOSSARY.md`; UI copy is in Italian (and the other locales).

## 1. Workflow

- **FLOW-01** [review] Before writing code, read the code and tests next to the change and reuse their patterns and helpers.
- **FLOW-02** [review] Make the smallest change that satisfies the ticket: no parallel legacy paths, no refactors nobody asked for.
- **FLOW-03** [review] For a bug, first write a test that fails without the fix.
- **FLOW-04** [review] A change is complete after the targeted tests, then format, then lint, typecheck, the full test suite, e2e, build and `astryx doctor --built`.
- **FLOW-05** [review] Never disable a lint rule to make code pass; fix the cause. A justified exception needs a comment with the reason and, if it is lasting, an ADR.

## 2. Formatting and TypeScript

- **TS-01** [lint] Prettier is the only formatter; nobody discusses spacing in review.
- **TS-02** [lint] `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`.
- **TS-03** [lint] Type-only imports use `import type`. No unused or duplicate imports, no import cycles (`import/no-cycle`). Imports are sorted.
- **TS-04** [lint] No `console` in app code (`warn` and `error` allowed only in server logging helpers).
- **TS-05** [lint] No `any` and no unsafe assignment, member access, call, argument or return (`@typescript-eslint/no-unsafe-*`). No `as never`, no non-null `!`, no `@ts-ignore` or `@ts-nocheck`; `@ts-expect-error` only with a description.
- **TS-06** [lint] No floating or misused promises; `await` only on thenables.
- **TS-07** [review] `unknown` only at a boundary with untrusted data (request body, external JSON, a caught error), narrowed at once with a Zod schema or a type guard. Never as the type of state, props, query results or domain values.
- **TS-08** [review] State variants are discriminated unions handled exhaustively. Workflows are named states with allowed transitions (for example AI suggestion: `running · ready · accepted · rejected · failed · cancelled`), never a set of booleans that can contradict each other.

## 3. Architecture and dependencies

- **ARC-01** [lint] Dependencies go one way: `routes → pages → widgets → features → entities → shared`, and `convex/` never imports from `src/`. No lateral imports: a feature does not import another feature, a widget another widget. Composition happens one layer above. Enforce it with `eslint-plugin-boundaries` (`default: disallow`, `no-unknown-files: error`).
- **ARC-02** [lint] App code never imports mocks or test utilities.
- **ARC-03** [lint] Route files only wire the loader, the data and the page: at most 30 lines (60 for the root route). No business rules in routes.
- **ARC-04** [review] Convex functions are thin: validate arguments, check the owner, call the domain module, return. The same rule is never copied into a query, a mutation, an action and an AI tool: they all call one domain function.
- **ARC-05** [review] Pure rules (publish checks, metric references, reserved-term matching, scroll ranges) live in pure modules without React, Convex context, network or side effects, with minimal inputs.
- **ARC-06** [review] No `utils/`, `helpers/`, `misc.ts` or `common/` folders. Every file lives in the area it serves. If no place fits, stop and propose a change to these standards.
- **ARC-07** [review] Generated files (`routeTree.gen.ts`, `convex/_generated/`, the Astryx theme copy) are never edited by hand.
- **ARC-08** [lint] Environment values are read in one config module, validated there; `process.env` / `import.meta.env` are not read anywhere else.

## 4. Readability and size

- **LEN-01** [lint] Limits: file 300 lines, function 100 lines, complexity 12, depth 4, parameters 4 (blank lines and comments excluded). Page components up to 220 lines. Tests, fixtures and seed data are exempt from the line limit only.
- **LEN-02** [review] A function over 70 lines needs a reason. The limits never justify artificial extractions: split by responsibility, never cut a file in half or squeeze code onto fewer lines.
- **LEN-03** [review] Each file and each hook has one nameable responsibility; the file name matches its main export.
- **LEN-04** [review] An orchestrating function shows its phases in the order they happen: check input and owner, read data, apply rules, write, return. Use guard clauses for invalid cases.
- **LEN-05** [review] One owner for each piece of authoritative state: server data belongs to the query cache (Convex + React Query), form state to the form, transient UI state to the component. No copies of the same value in two stores.
- **LEN-06** [review] Pass minimal dependencies: no generic `data`, `manager`, `handlers` or `flow` objects passed whole. `<Avatar imageUrl name />`, not `<Avatar user />` when it needs two fields.
- **LEN-07** [review] No pass-through wrappers and no helpers without domain meaning. Extract shared code only when two paths are truly the same domain rule.
- **LEN-08** [review] Build data with `map`, `filter`, `flatMap`, `reduce`, `some`, `every`, `find`; `forEach` only for side effects. Compute first, then apply side effects.
- **LEN-09** [review] Long conditions become named predicates.

## 5. Naming

- **NAME-01** [review] The same glossary term for the same concept in schema, Convex table, function, hook, component and test (Block, Face, Slab, Chapter, Metric, Release…). No generic names (`data`, `item`, `result`, `values`, `process`, `handle`).
- **NAME-02** [lint] No one-letter identifiers, not even `i`, `e`, `x` (`id-length` min 2, `_` allowed). No invented abbreviations.
- **NAME-03** [review] Booleans answer a yes/no question: `is`, `has`, `can`, `should`. Counts name the thing and why it matters.
- **NAME-04** [review] Functions start with a verb that says exactly what they do. A name that needs "and" (`validateAndSave`) is two functions. `prepare*` never performs the effect; commands name the user's intent (`publishRelease`, `rollBackRelease`, `acceptSuggestion`), not `set*`, `toggle*` or `handle*` in the domain API (`handle*` is fine for DOM event props only).
- **NAME-05** [review] Mappers state source and target (`toProjectViewFromContent`). Zod schemas end in `Schema`, query option factories in `QueryOptions`.
- **NAME-06** [review] Units and states are in the name when they could be confused: `durationMs`, `scrollRangeStart`, `verifiedAt`, `estimatedCostUsd`. A verified value and an estimate never share a name.
- **NAME-07** [review] Files and folders in kebab-case; components and types in PascalCase; hooks start with `use`; module-level constants in SCREAMING_SNAKE_CASE.

## 6. Validation, data and copy

- **DATA-01** [review] Every boundary validates at runtime: Convex arguments with validators, external responses (npm, GitHub, AI output, R2 metadata) with Zod, then typed values inside.
- **DATA-02** [lint] Zod idioms enforced by `no-restricted-syntax` (for example `z.uuid()` / `z.url()`, never the deprecated `z.string().uuid()` form).
- **DATA-03** [review] Expected failures the owner must see (rule violation, stale draft, reserved term) are typed results shown in the UI; unexpected or authorization failures throw. Never swallow an error into a plausible value: a failed metric source is never shown as `0`.
- **DATA-04** [review] Every screen handles loading, empty, error and ready explicitly.
- **DATA-05** [review] User-visible text never lives inline in components: it comes from content in Convex or from the locale message files, including `aria-label` and validation messages. Numbers never appear as free text (ADR 0004).
- **DATA-06** [review] Writes are idempotent where a double click or a retry can repeat them (publish, accept suggestion, upload).

## 7. UI and accessibility

- **UI-01** [review] Astryx components only, as `AGENTS.md` says: no raw `<div>`, no `style={{}}`, no hard-coded colours, sizes or durations; token-backed utilities only.
- **UI-02** [lint] `jsx-a11y` recommended rules as errors.
- **UI-03** [lint] A JSX component never receives numeric literals for `width`, `height`, `size`, `iconSize`: sizes come from the token scale.
- **UI-04** [review] Ids for ARIA use `useId()`. Do not combine `aria-label` and visually hidden text on the same target. Modal surfaces close through one path and return focus.
- **UI-05** [review] Motion respects reduced motion and touch (see PLAN "Design resolutions"); animation writes transforms through refs or motion values, never `setState` per frame.

## 8. Comments and docs

- **DOC-01** [review] Names say what; comments say why (an invariant, a provider limit, a browser quirk). No comments that repeat the next line, no commented-out code, no `TODO` without an issue link.
- **DOC-02** [review] A complex area gets a short README next to its files: flow, main files, dependencies, invariants. A cross-cutting decision becomes an ADR.

## 9. Tests

- **TEST-01** [review] Tests check observable behaviour and invariants, not implementation. Names describe the behaviour.
- **TEST-02** [review] Tests live next to the module they cover. Every pure rule module has direct unit tests; Convex functions are tested with `convex-test`; user flows with Playwright.
- **TEST-03** [review] Every component extracted to its own file has a direct test of its public contract.
- **TEST-04** [review] Small integration files, one scenario each, no duplicated `it(...)`. Repeated setup becomes a named helper.
- **TEST-05** [review] Coverage never goes down.
- **TEST-06** [review] Critical paths also test the double click, the network loss after the request and the stale draft.

## 10. Review of AI-written code

- **AI-01** [review] Read the code, not only the UI or the API result: check architecture, dead code and parallel implementations left behind.
- **AI-02** [review] After a merge or rebase between worktrees, check that no earlier change was overwritten.
- **AI-03** [review] Review in a loop with a fresh-context agent that knows these rules, until it finds nothing; then a human reads the diff.
