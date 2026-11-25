# Notes

The `note` collection of the content store (ADR 0003): articles in Markdown with directives, per locale. Functions in `convex/notes.ts` (thin: owner check, one call here, return); publish, scheduling and rollback go through `content.publish` / `content.rollback` like every collection.

## Flow

- **Draft**: the CMS creates a note under a key it chose (`notes.createNote`, so a repeated create is one note), then live-saves through `notes.saveDraft` → `drafts.ts` (tables `notes` + `noteContent`). Each save moves `revision`, which `content.publish` checks (stale draft). The store reads note drafts through `content/drafts.ts`, which dispatches on the collection.
- **Rules**: `noterule.ts` (slug format and uniqueness, an Italian title, every translation titled, directives that parse, `::metric` keys that exist; figures only warn) joins `PUBLISH_RULES`. The free-numeral and reference rules read note prose through `content/prose.ts` → `prose.ts`: title, summary and the text of the body, never code, link addresses or directive attributes.
- **Markdown**: `markdown.ts` (blocks, directives) + `simpleblocks.ts` (paragraph, list, quote, fenced code) + `inline.ts` (strong, emphasis, code, safe links) + `directive.ts` (directive lines) + `anchors.ts` (heading ids). The output is plain runs and blocks, never markup: raw HTML stays text, a link keeps only an `http(s)`, `mailto:`, site-path or `#anchor` address.
- **Render**: `render.ts` turns metric references and `::metric` into verified figures through `metrics/render.ts` (ADR 0004), drops figures, and reads the Outline and the reading time. `rendered.ts` holds the validators of what the site gets.
- **Read**: the site reads `notes.listPublished` / `notes.getPublished` → `published.ts`, only through published pointers, with every translation rendered in its own locale; the page picks one with the shell's fallback. The CMS reads `notes.listNotes` / `notes.getEditableNote` → `cms.ts`.

## Directives

- `:::case{title="…"}` … `:::` — a box with a title and simple blocks (paragraphs, lists, quotes, code); its title is an Outline entry.
- `::metric[label]{key="…"}` — a metric figure with its label and verification date.
- `::figure[caption]{media="…"}` — an image from media. Media arrive with ticket 12 (#20): until then a figure renders nothing and its rule only warns.

## Invariants

- A note's status (draft, scheduled, published) is never stored: `publication.ts` reads it from pointers and scheduled releases.
- A note's public date is the `publishedAt` of the release behind its live version; the Note list and "next" go newest first.
- "Next" is the next older **published** note: unpublished notes are never read by the site.
- The slug is shared by every locale (`/note/<slug>`); the key never changes.
