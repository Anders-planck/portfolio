# 0010 · Theme and motion params become CSS in a Convex query

Status: accepted · 2026-11-24

The published theme params (type scale `base` and `ratio`, `fonts` body/heading/code, `radiusMultiplier`, `mode`) and motion params (`tempo`, `character`) live in Convex. A Convex query applies them to the portfolio theme with Astryx's own generators (`defineTheme({ extends })` + `generateThemeCSS`) and returns the params with the CSS they make. The root route awaits that query in its loader, renders the CSS in a `<style>` after the built theme stylesheet (same `astryx-theme` layer and `@scope`, so it wins by order), and sets `data-theme` and `data-astryx-theme` on `<html>` on the server. `<Theme>` keeps the built theme. The page has the params on first paint, hydration renders the same string, and the query is live, so a publish restyles open pages without a reload or a rebuild.

How each param maps: `base`/`ratio` → Astryx type scale (the theme's heading weights are carried over); `fonts` → family names with fixed fallbacks; `radiusMultiplier` → multiplies the theme's own radius tokens (`none` and `full` stay); `tempo` → multiplies the theme's own duration tokens and sets Astryx tempo, which springs read (the neutral base sets a duration scale, so the Astryx knob alone would not move durations); `character` → the Astryx knob; `mode` → `<Theme mode>` and `<html data-theme>`. Font names go into raw CSS, so they are allow-listed (letters, digits, hyphens, spaces) on write and again on generation; numbers are range-checked on write and clamped on generation.

Rejected: a runtime theme passed to `<Theme>` (Astryx injects it on the client, so it flashes); generating in the Worker or the component (same CSS, but the generator adds ~6 KB gzip to the client and ~20 ms at hydration, or CPU on every request; in Convex it runs once per publish); hand-written CSS variables (duplicates Astryx's type-scale, dynamic-type and adaptation rules); rebuilding the theme on publish (needs a deploy).

Limits, for later tickets:
- The CSS is the whole theme (~28 KB, ~4.5 KB gzip), inline in every page and again in the dehydrated query state. Serving it as a cacheable stylesheet keyed by a hash is the next step if the budget needs it (ticket 17).
- Only fonts the page already loads (Figtree, from the theme) or the reader has installed render; loading new font files is not covered.
- The theme's touch adaptation (coarse pointer under 1024px) keeps its own type scale; `base`/`ratio` apply everywhere else.
- Project colour tokens are not covered yet.
- Convex generates from the theme source in `themes/portfolio/` (it cannot load the built module's stylesheet), so a theme change ships with a Convex deploy as well as a site deploy; `astryx doctor` checks the built files match the source.
- `siteSettings` is a stand-in: the content store (ADR 0003, ticket 03) replaces it with `theme` and `motion` documents with drafts and releases, and owner auth guards the write.
- The defaults (base 16, ratio 1.25, design resolution 11) differ from the built theme (14, 1.2), so the generated CSS always applies.
