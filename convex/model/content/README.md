# Content store

Domain code behind `convex/content.ts` (ADR 0003). The functions there are thin: owner check, one call here, return.

## Flow

- **Draft**: `saveDraft` → `drafts.ts` `saveDraftEdit` patches the per-collection draft tables (`profile` from `fields`, `profileContent` per locale from `localeEdit`), creating them from empty values on the first edit.
- **Publish**: `publish` → `releases.ts` `publishSelection`: each selected document carries the draft `revision` the owner reviewed (`saveDraft` returns it; every save moves it), and a draft saved since then returns `stale` and writes nothing. Then it reads the selected drafts as snapshots, runs `rules.ts` `PUBLISH_RULES` (a `block` finding returns `blocked` and writes nothing), writes immutable versions (`versions.ts`), records a release and moves the published pointers (`pointers.ts`).
  `limits.ts` refuses a request that is empty, names a document twice, holds more than 100 documents or has a note over 500 characters.
- **Schedule**: the same call with a future `scheduledAt` freezes the versions now, records a `scheduled` release with each document's current pointer (`expectedPointers`) and schedules `content.publishScheduled`. When it runs: if a pointer moved since (a later publish or rollback), the release becomes `failed` with `{ kind: 'conflict', documents }`; else if a rule blocks, `failed` with `{ kind: 'rules' }`; else `published`. All documents or none.
- **Rollback**: `rollback.ts` `rollBackToRelease` restores the site as it was right after the target release: every document points at the version it had then, documents first published later are unpublished (`pointers.ts` `replaceLiveSite`). It is a new `published` release with `rolledBackFrom`. No rules, drafts untouched.
- **Read**: the public site reads the `getPublished` query → `pointers.ts` `readPublishedDocument`. Preview calls the `getDraft` action with a token from `preview.ts` (HMAC-SHA256, one hour, secret of at least 32 bytes from `model/env.ts`): `ready` with the draft, `expired` or `no-draft`; a token this backend did not sign throws. It is an action so expiry is checked against the clock on every call; a cached query result could outlive the link.

## Files

| File | Owns |
|---|---|
| `locales.ts` | Site locales and their guard. |
| `profile.ts` | Profile fields, per-locale content fields (listed once, in the validator and `pickProfileContentFields`) and their empty values. |
| `snapshot.ts` | Collections, the snapshot of a whole document, its per-locale view. |
| `drafts.ts` | Draft writes, draft reads as snapshots, draft reads for preview. |
| `rules.ts` | The publish rules hook and finding shape (`{rule, severity, field, locale, message}`). |
| `rulecontext.ts` | What rules know beyond the document: the metric keys that exist, every slug a note holds (draft, live, scheduled) and the note count (read once per publish). |
| `prose.ts` | The prose fields of a document, where figures must be metric references. |
| `numeralrule.ts` | The free-numeral rule (ADR 0004); the finder is `model/metrics/numerals.ts`. |
| `referencerule.ts` | Metric references must be well formed and name an existing metric. |
| `versions.ts` | Writing and reading immutable versions. |
| `pointers.ts` | Published pointers, the public read, the live set of the whole site. |
| `limits.ts` | Limits of one publish request (pure): size, duplicates, note length. |
| `requests.ts` | Idempotency: `requestId` with its kind (publish or rollback). |
| `releases.ts` | Release shapes, publish, scheduled publish and its conflict check. |
| `rollback.ts` | Restoring the site of an earlier release. |
| `preview.ts` | Signing and verifying preview tokens (pure). |
| `seed.ts` | The verified seed profile and publishing it once. |

## Invariants

- Versions are never changed or deleted; a release only refers to them.
- The public site reads only through published pointers, so a draft is never public.
- Publish and rollback take a `requestId`, stored with its kind; repeating it returns the first release (double click, retry), and reusing it for the other kind throws.
- Every `published` release stores `liveVersionIds`, the whole live site right after it; rollback restores exactly that set.
- A scheduled release never overwrites newer live content and is never applied in part.
- A release's status decides its fields: `scheduled` has `scheduledAt` and `expectedPointers`, `published` has `publishedAt` and `liveVersionIds`, `failed` has `scheduledAt`, `failedAt` and `failure`.

## Adding a collection

Add its literal to `collectionValidator`, a member to `snapshotValidator` and `localizedDocumentValidator` (and to `toLocalizedDocumentFromSnapshot`), add its draft tables to the schema, a case to `readDraftRevision` and `readDraftSnapshot` in `drafts.ts`, and its prose fields to `prose.ts`. A collection with its own editor saves through its own mutation with the same contract as `saveDraft` (`{savedAt, revision}`), as `note` does (`convex/notes.ts`, `model/notes/`); `saveDraft` and `getEditableDraft` stay the Profile's.

## Pending rules

- **Linked projects of a note** (TODO(#17)): when the projects collection lands (ticket 09), a publish rule blocks a note whose `linkedProjectKeys` name a project that does not exist. Until then the field is stored as picked.
- **Per-locale slugs** (resolution 19): deferred to ticket 16 (#25); a note's slug is shared by every locale today.
