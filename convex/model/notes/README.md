# Notes

The `note` collection of the content store (ADR 0003): articles in Markdown with directives, per locale. Functions in `convex/notes.ts` (thin: owner check, one call here, return); publish, scheduling and rollback go through `content.publish` / `content.rollback` like every collection.

## Flow

- **Draft**: the CMS creates a note under a key it chose (`notes.createNote`, so a repeated create is one note), then live-saves through `notes.saveDraft` → `drafts.ts` (tables `notes` + `noteContent`). Each save moves `revision`, which `content.publish` checks (stale draft). The store reads note drafts through `content/drafts.ts`, which dispatches on the collection.
- **Rules**: `noterule.ts` joins `PUBLISH_RULES`: slug format; a slug no other note holds in its draft, live or in a pending scheduled release (`slugclaims.ts`, so a renamed draft cannot free a live address); an Italian title and every translation titled; directives and fences that parse; `::metric` keys that exist; at most `MAX_NOTES` notes. Figures only warn. The free-numeral and reference rules read note prose through `content/prose.ts` → `prose.ts`: title, summary and the text of the body, never code (fenced or inline: `useState(0)` is code, not a figure), link addresses or directive attributes.
- **Markdown**: `markdown.ts` (blocks, directives) + `simpleblocks.ts` (paragraph, list, quote, fenced code) + `inline.ts` (strong, emphasis, code, safe links) + `directive.ts` (directive lines) + `anchors.ts` (heading ids). The output is plain runs and blocks, never markup: raw HTML stays text. A link keeps its address only if it is an `http(s)` or `mailto:` address the URL parser reads, an `#anchor`, or a site path that still resolves to the site; control characters and `\` are refused anywhere (browsers drop or rewrite them, `/\host` leaves the site). Every line that starts with `::` is a directive: one that does not parse (a space before `{`, `]` in the label, text after `}`, a stray `:::`) is a problem and renders nothing. A `:::` inside fenced code never closes a case; a fence left open is a problem.
- **Render**: `render.ts` turns metric references and `::metric` into verified figures through `metrics/render.ts` (ADR 0004), drops figures, and reads the Outline and the reading time. `rendered.ts` holds the validators of what the site gets.
- **Read**: the site reads `notes.listPublished` / `notes.getPublished` → `published.ts`, only through published pointers, with every translation rendered in its own locale; the page picks one with the shell's fallback. The CMS reads `notes.listNotes` / `notes.getEditableNote` → `cms.ts`.

## Directives

- `:::case{title="…"}` … `:::` — a box with a title and simple blocks (paragraphs, lists, quotes, code); its title is an Outline entry.
- `::metric[label]{key="…"}` — a metric figure with its label and verification date.
- `::figure[caption]{media="…"}` — an image from media. Media arrive with ticket 12 (#20): until then a figure renders nothing and its rule only warns.

## Invariants

- A note's status (draft, scheduled, published) is never stored: `publication.ts` reads it from pointers and scheduled releases.
- A note's public date is when it first went live: publish records it once per key in `noteFirstPublications` (`firstpublication.ts`, called from `content/releases.ts`), so publishing an edit, a scheduled release or a rollback never moves it. The Note list and "next" go newest first by that date.
- "Next" is the next older **published** note: unpublished notes are never read by the site.
- The slug is shared by every locale (`/note/<slug>`); the key never changes. Per-locale slugs (resolution 19) are deferred to ticket 16 (#25).
- The key is an editor-made id (`checkNoteKey`); `createNote` and `saveDraft` refuse any other. Reads list at most `MAX_NOTES` notes, and that cap is never passed: `createNote` returns `limit-reached` and a publish past it is blocked.
- Linked project keys are not checked yet: the publish rule against the projects collection comes with it (TODO(#17), ticket 09).
