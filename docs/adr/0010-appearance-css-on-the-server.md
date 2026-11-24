# 0010 · Appearance params become Astryx CSS on the server

Status: accepted · 2026-11-24

The published appearance (theme params: type scale `basePx` and `ratio`, `fonts` body/heading/code, `radiusMultiplier`, `mode`; motion params: `tempo`, `character`) lives in Convex. Convex validates it on publish (ranges, font names) and serves it from a live query. A TanStack Start server function applies it to the built portfolio theme with Astryx's own generators (`defineTheme({ extends })` + `generateThemeCSS`) and returns the CSS. The root loader fills both queries, so the server renders the CSS in a `<style>` after the built theme stylesheet (same `astryx-theme` layer and `@scope`, so it wins by order) and sets `data-theme` and `data-astryx-theme` on `<html>`. `<Theme>` keeps the built theme. The first paint has the params, hydration renders the same string, and a publish restyles open pages without a reload or a rebuild: the live params change the CSS query key, the browser fetches the new CSS and keeps the old one until it arrives.

How each param maps: `basePx`/`ratio` → Astryx type scale (the theme's heading weights are carried over); `fonts` → family names with fixed fallbacks; `radiusMultiplier` → multiplies the theme's own radius tokens (`none` and `full` stay); `tempo` → multiplies the theme's own duration tokens and sets Astryx tempo, which springs read (the neutral base sets a duration scale, so the Astryx knob alone would not move durations); `character` → the Astryx knob; `mode` → `<Theme mode>` and `<html data-theme>`. Font names go into raw CSS, so Convex accepts only letters, digits, hyphens and single spaces.

The server function takes no input: it reads the published params from Convex itself, so nobody can make it generate arbitrary CSS, and the CSS is only ever made from validated params. It keeps the last few results per Worker isolate, so the generators run about once per publish per isolate.

Rejected: a runtime theme passed to `<Theme>` (Astryx injects it on the client, so it flashes); generating in the browser (the generators add ~6 KB gzip and ~20 ms at hydration); generating in a Convex query (Convex code may not import the theme, ARC-01); hand-written CSS variables (duplicates Astryx's type-scale, dynamic-type and adaptation rules); rebuilding the theme on publish (needs a deploy).

Limits, for later tickets:
- The CSS is the whole theme (~28 KB, ~4.5 KB gzip), inline in every page and again in the dehydrated query state. Serving it as a cacheable stylesheet keyed by a hash is the next step if the budget needs it (ticket 17).
- Server rendering reads the params twice from Convex (the live query and the server function). One round trip more per page render.
- Only fonts the page already loads (Figtree, from the theme) or the reader has installed render; loading new font files is not covered.
- The theme's touch adaptation (coarse pointer under 1024px) keeps its own type scale; `basePx`/`ratio` apply everywhere else.
- Project colour tokens are not covered yet.
- The `appearance` table is a stand-in: the content store (ADR 0003, ticket 03) replaces it with `theme` and `motion` documents with drafts and releases, and owner auth guards the write.
- The defaults (base 16, ratio 1.25, design resolution 11) differ from the built theme (14, 1.2), so the generated CSS always applies.
