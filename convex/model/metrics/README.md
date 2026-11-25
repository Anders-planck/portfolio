# Metrics

Domain code behind `convex/metrics.ts` (ADR 0004): every number on the site is a metric with a source, readings and a status. The functions there are thin: owner check, one call here, return.

## Flow

- **Define**: Fonti "Nuova fonte" → `createMetric` → `definitions.ts` `addMetric`, checked by `checks.ts` (key grammar, npm package name, `owner/name` repos, GitHub login, non-empty query). Repeating the same definition is a no-op; another definition under a taken key is `key-taken`.
- **Refresh**: the daily cron (`convex/crons.ts`) runs `refreshDueSources`, "Aggiorna ora" runs `refreshNow`; both call `refresh.ts` `refreshSources`, which reads each automated source through `adapters.ts` (npm in `npm.ts`, GitHub in `github.ts`, one GET each in `http.ts`, responses validated with Zod) and records the result with `readings.ts` `recordReading`. `status.ts` `isRefreshDue` decides which sources the cron reads: a cadence after the last verified reading, so a failed weekly read is retried the next day. A second verified read within ten minutes writes no second reading.
- **Manual count**: `recordManualCount` → `definitions.ts` `addManualCount`: a whole count, the day it was made and its evidence. It expires after 90 days (`status.ts`, `expired`: a warning, the value still shows).
- **Read**: `getSourcesOverview` → `overview.ts` (Fonti rows with the figure formatted in Italian, its date, evidence and status). The GitHub token comes from `model/env.ts`; only whether it is set leaves the backend.
- **Render**: `render.ts` `renderMetricReferences` turns prose with `{{m:key}}` (`references.ts`) into segments: text, a metric (formatted for the page locale by `format.ts`, with its verified date), or `unavailable`.
- **Rules**: `numerals.ts` `findFreeNumerals` is the free-numeral rule; `model/content/numeralrule.ts` (`numeralRule`) runs it over a document's prose fields. `model/content/referencerule.ts` blocks malformed references and keys missing from `metrics`. Both are `block` rules in `PUBLISH_RULES`.

## Files

| File | Owns |
|---|---|
| `references.ts` | The `{{m:key}}` grammar and its parser (pure). |
| `numerals.ts` | Free numerals in prose (digits of any script): only bare years 1990–2099 and a list of technical names (`i18n`, `R2`, `OAuth2`, `v8.4`, `2D`/`3D`) pass (pure). |
| `format.ts` | Figure formats (`count`, `count-of-total`, `at-least`), the rounding choice and locale formatting (pure). |
| `render.ts` | Rendering metric references for a locale (pure). |
| `status.ts` | Status of a metric, the 90-day manual expiry, refresh timing (pure). |
| `checks.ts` | Checks of a definition and a manual count, as typed problems (pure). |
| `sources.ts` | Source kinds and cadences. |
| `attempts.ts` | A read's outcome: a figure or a typed failure reason. |
| `http.ts`, `npm.ts`, `github.ts`, `adapters.ts` | Reading the external sources. |
| `tables.ts` | `metrics`, `metricReadings`, `metricSettings` (spread into `convex/schema.ts`). |
| `readings.ts` | Readings and the rounding setting in the database. |
| `definitions.ts` | Creating metrics and recording manual counts. |
| `overview.ts` | The Fonti rows. |
| `targets.ts` | The automated metrics the refresh reads. |
| `refresh.ts` | The refresh action. |
| `seed.ts` | The metrics listed in the `cms-fonti` mockup. |

## Invariants

- A failed read never writes a reading: the last verified figure and its date stay, the status says `failing` with the reason. A metric with no reading renders `unavailable`, never `0` (DATA-03).
- A source marked `needsToken` is never read without `GITHUB_TOKEN` (GitHub would answer with only the public part), and only such a source gets the token, so a public one never counts private data. Contributors are read with `anon=1`, so the total includes commits by unlinked emails. An author missing from the contributors is a failure, not zero.
- Metrics are live data, not released content (ADR 0003 covers documents): a new reading or rounding choice shows on the site without a publish.
- A manual count needs evidence; the same count recorded twice is stored once.
