/**
 * When a Stage is immersive (ADR 0008, resolution 7): a wide screen (the
 * header's `lg`), a fine pointer and motion allowed. The same query is the
 * `immersive:` Tailwind variant in `src/styles/globals.css`; keep them equal.
 */
export const IMMERSIVE_MEDIA_QUERY =
  '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
