# Site design review (independent agent, 24 Nov 2026)

Scope: the public-site mockups in `docs/redesign/design/` (Home, Lavori, Percorso, ProgettoView + 9 `p-*` wrappers, Note, Nota, NotFound, Motion). Every finding below is resolved in `docs/redesign/PLAN.md` → "Design resolutions". The mockups are reference for look, content and motion; where they disagree with the resolutions, the resolutions win.

## Consistency
- Four different headers (Home/Lavori; Percorso/ProgettoView breadcrumb; Note/Nota with CV button and max-width gutters; NotFound with logo + language menu only). Percorso breadcrumb says "Lavori / Percorso" and repeats "Lavori". Home shows "Lavori" bold as if current; no `aria-current`.
- The control under the block means different things: rotates faces on Home (`n/4`), changes chapter on Percorso/Progetto (`/ 06`). Chapter numbering off by one ("02 / 06" vs "01 · Il problema").
- Cursor: immersive pages hard-code it (always on); Note/Nota/404 use Motion (respects touch and reduced motion) but with fixed colours.
- Line-height 1.5 / 1.55 / 1.65 across pages; fixed sizes `7rem`, `1.0625rem`.
- `--color-background-purple` / `--color-text-purple` missing in ProgettoView (Wortschatz broken). Expo tag is teal on its page, accent elsewhere.
- Same object called "blocco", "lastra", "monolite", "pezzi".

## UX
- Language switch never works: "IT" links to the 404; the real menu exists only on the 404.
- Home faces are links but blocked outside the Lavori chapter; the block has 5 slabs but the control says "/4" (LECO hidden). "Passa sopra" / "Trascina" make no sense on touch.
- Lavori: details only on the centred or hovered slab; scroll length is fixed (4600px) regardless of filter.
- Projects: only "next" (closed loop), no "previous", no position (3/9), no links to repo/npm/live.
- Back button loses position (scroll lives in a div); chapters are not linkable.
- Note/Nota hide navigation under 900px with no replacement.
- Small screens: use window scroll, `100svh`, fluid gutters; under 1024px or on touch, no pinned scene — Home hero with a static block image and chapters as stacked sections; Lavori as a list or scroll-snap carousel; Project as a linear article; Percorso as a vertical timeline. Check 1280×720 overlaps.

## Accessibility
- Scroller never receives focus; arrows/PageDown/space fail until a click. Lavori has no chapter index; Tab walks 9 slabs including invisible ones, without moving the scene; no `:focus-visible` on slabs. Home faces are tabbable no-ops before the Lavori chapter.
- `sc-if` removes hidden chapters from the DOM, `h1` included: screen readers, find-in-page and SEO see one chapter.
- `cursor:none` forced on immersive pages even on touch / reduced motion; the ring disappears on the black Expo slab.
- Reduced motion still runs parallax, mouse tilt, magnetic button and smooth `scrollTo`.
- 404 language menu has `role="menu"` without arrow keys, Esc or focus management.
- Text contrast is fine (#474747 on #f1f1f1 ≈ 8.2:1).

## Astryx fidelity
Reinvented parts and their Astryx equivalents: pills → `Button`/`Link`; Lavori/Note filters → `SegmentedControl`; header → `TopNav`; language menu → `DropdownMenu`; status dots/"Pubblicata" → `StatusDot` (not `Badge`); tags → `Token`; progress bar → `ProgressBar`; chapter index → `Stepper`; Nota TOC → `Outline`; stat cards `<dl>` → `MetadataList`; note rows → `List`/`Item`; yellow boxes → `Banner`. Raw divs and inline styles everywhere; Note/Nota redefine `:root` tokens by hand.

## Feasibility
- `setState` on every mousemove and every frame re-renders the whole page at 60fps → use refs / motion values writing transforms directly.
- CSS 3D is enough (crisp text, accessible DOM, SSR-friendly). If R3F is used: one lazy client-only `<Canvas>`, `frameloop="demand"`, dpr ≤ 1.5, static poster for SSR and mobile, face text stays in the DOM.
- Real sections in window scroll, sticky scene, active chapter via IntersectionObserver / `useScroll` — not a div scroller with hand-written breakpoints.
- Render every chapter on the server; cursor and measurements after hydration. Magnetic offsets must come from `getBoundingClientRect`, not constants.

## Content
- Open placeholders: "Cosa ho imparato" ×9, pizzeria client need, LECO users, dead links `#cv`, `#rss`, `#en`, `#n2–#n5`.
- Inconsistent numbers and labels across pages (pizzeria 241 vs 183/259; LECO 1.072 vs 213/1.198; Madisoft "mar–nov 2026" vs "mar 2026 — oggi"; SDK 2025–2026 vs 2025; Expo "2.150 download" vs "2.150 download/anno"; Parseur "Prototipo" vs "Prototipo personale"; pizzeria title and kind differ).
- Home promises "due casi reali" but Nota tells one; Bussola case wording differs between Nota and Progetto; Home timeline not chronological; "Prossima nota" points to an unpublished note; Note filter counts unpublished notes; Nota exposes the internal file path.
