# Glossary

Domain words for the portfolio and its CMS. Code identifiers use the English term; UI copy uses the Italian one.

| Term (code) | UI (IT) | Meaning |
|---|---|---|
| Block | blocco | The 3D object on immersive pages: four faces plus top and bottom caps. Rotates with scroll, follows the pointer, can be dragged and snaps to a face. Never called "monolite" or "cubo" in UI copy. |
| Face | faccia | One of the four sides of the Block. On Home a face is a discipline; on a project page a face is a chapter; on Percorso a face is a milestone. |
| Slab | lastra | A project card in 3D: the Home gallery chapter and the Lavori gallery are made of slabs. One slab per project. |
| Immersive page | pagina immersiva | Home, Lavori, Percorso and every project page: window-scroll chapters with a sticky scene on wide screens with a fine pointer; a linear layout otherwise. |
| Chapter | capitolo | A section of an immersive page bound to a scroll range. Always rendered in the DOM, linkable by anchor. |
| Stage | scena | The engine of an immersive page: its chapters and the Block, laid out immersive (pinned scene) or linear. Not a Project stage. |
| Chapter index | indice dei capitoli | The list of chapters on the right of an immersive page (Astryx `Stepper`). |
| Project | progetto | A piece of work shown on the site. Has a kind, a visibility and per-locale content. |
| Project kind | tipo | lavoro · open source · cliente · personale · prototipo. Not a status. |
| Project stage | fase | in produzione · in sviluppo · specifica e design. |
| Visibility | visibilità | public or reserved. A reserved project hides product and domain details and is checked against reserved terms. |
| Note | nota | An article in Markdown with directives, per locale. |
| Milestone | tappa | A step of the career path shown on Percorso. |
| Metric | metrica | A number shown on the site, with a source (npm, GitHub, manual with evidence), a last-verified time and a status. |
| Metric reference | riferimento a metrica | `{{m:<key>}}` inside prose. The only allowed way to put a figure in free text. |
| Source | fonte | Where a metric comes from and how it is refreshed. |
| Draft | bozza | The live-saved editable state of a document. |
| Version | versione | An immutable snapshot of a document. |
| Release | pubblicazione | A set of versions made live together by one publish. Can be scheduled and rolled back. |
| Rule | regola | A publish check with severity block or warn. Runs in the CMS and again on the server at publish. |
| Reserved term | termine riservato | A word that must never appear in public content (employer product details). Stored hashed, never readable back. |
| AI suggestion | proposta AI | A change proposed by the assistant for one field in one locale. States: running · ready · accepted · rejected · failed · cancelled. Never applied without the owner. |
| Media | media | An image or file the owner uploaded to R2 (the CV is one). Documents point at it by id; it is live data, not released. |
| Alt text | testo alternativo | What a screen reader says for an image, one per locale. Required in every locale that shows the image (publish rule); never blank. |
| Theme | tema | The look the owner can change without a deploy: type scale, fonts, corner radius, colour mode. Published like content. |
| Motion | movimento | How the site moves: tempo (speed) and character (crisp, standard, expressive). Reduced motion always wins over it. |
| Appearance | aspetto | The published theme and motion together: what the site looks and moves like. |
| Owner | proprietario | The only CMS user (GitHub account on the allowlist). |
| Session | sessione | One signed-in browser of the owner (Convex Auth). Ends on sign-out, on expiry, or at once when the owner's id leaves the allowlist. |
