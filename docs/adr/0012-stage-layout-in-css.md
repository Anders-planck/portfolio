# 0012 · The Stage's layout is CSS; its header offset reads AppShell's measured height

Status: accepted · 2026-11-25

The Stage renders one DOM for both layouts of ADR 0008, and the `immersive:` Tailwind variant (`src/styles/globals.css`: ≥1024px, fine pointer, no reduced motion) lays it out. The server therefore renders the right geometry, the first load does not shift, and Back and reload restore the scroll natively; JS only adds behaviour (the driven Block, the active chapter, the navigation, keeping the reading position when the layout flips).

Pinned chapter text and the scene sit below the sticky header. Astryx has no public header-height token, so the `--spacing-header` token reads AppShell's measured `--_app-shell-header-height` (a private variable) with a fallback equal to this theme's header height for the paint before AppShell measures. If an Astryx upgrade renames or drops the variable, the fallback keeps the layout usable and this token is the one place to change.
