# Content store

Domain code behind `convex/content.ts` (ADR 0003). The functions there are thin: owner check, one call here, return.

## Flow

- **Draft**: `saveDraft` → `drafts.ts` `saveDraftEdit` patches the per-collection draft tables (`profile` from `fields`, `profileContent` per locale from `localeEdit`), creating them from empty values on the first edit.
- **Publish**: `publish` → `releases.ts` `publishSelection`: each selected document carries the draft `revision` the owner reviewed (`saveDraft` returns it; every save moves it), and a draft saved since then returns `stale` and writes nothing. Then it reads the selected drafts as snapshots, runs `rules.ts` `PUBLISH_RULES` (a `block` finding returns `blocked` and writes nothing), writes immutable versions (`versions.ts`), records a release and moves the published pointers (`pointers.ts`).
- **Schedule**: the same call with a future `scheduledAt` freezes the versions now, records a `scheduled` release and schedules `content.publishScheduled`; when it runs, the rules run again and the release becomes `published` or `failed`.
- **Rollback**: `rollBackToRelease` records a new `published` release with the target's versions (`rolledBackFrom`) and moves the pointers back. No rules, drafts untouched.
- **Read**: the public site reads `getPublished` → `pointers.ts` `readPublishedDocument`; preview reads `getDraft` with a token from `preview.ts` (HMAC-SHA256, one hour, secret from `model/env.ts`).

## Files

| File | Owns |
|---|---|
| `locales.ts` | Site locales and their guard. |
| `profile.ts` | Profile fields, per-locale content fields (listed once, in the validator and `pickProfileContentFields`) and their empty values. |
| `snapshot.ts` | Collections, the snapshot of a whole document, its per-locale view. |
| `drafts.ts` | Draft writes, draft reads as snapshots, draft reads for preview. |
| `rules.ts` | The publish rules hook and finding shape (`{rule, severity, field, locale, message}`). |
| `versions.ts` | Writing and reading immutable versions. |
| `pointers.ts` | Published pointers and the public read. |
| `releases.ts` | Release shapes, publish, scheduled publish, rollback. |
| `preview.ts` | Signing and verifying preview tokens (pure). |
| `seed.ts` | The verified seed profile and publishing it once. |

## Invariants

- Versions are never changed or deleted; a release only refers to them.
- The public site reads only through published pointers, so a draft is never public.
- Publish and rollback take a `requestId`; repeating it returns the first release (double click, retry).
- A release's status decides its timestamps: `scheduled` has `scheduledAt`, `published` has `publishedAt`, `failed` has `scheduledAt` and `failedAt`.

## Adding a collection

Add its literal to `collectionValidator`, a member to `snapshotValidator` and `localizedDocumentValidator`, widen `draftEditValidator`, add its draft tables to the schema, and a case to the draft read and write in `drafts.ts`.
