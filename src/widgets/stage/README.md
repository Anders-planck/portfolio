# Stage (immersive engine)

The engine of every immersive page (GLOSSARY): Home, Lavori, Percorso and the
project pages give it their chapters and Block faces as data (`StageChapter`,
`BlockFaces`); the demo at `/demo` runs it on placeholder copy.

## Flow

- One DOM for both layouts. CSS picks the layout with the `immersive:`
  variant (`src/styles/globals.css`: ≥1024px, fine pointer, no reduced
  motion; ADR 0008, resolution 7), so the server already renders the right
  geometry and the first load does not shift. JS adds behaviour only.
- `stage.tsx`: scene first, then the chapters. Immersive: a row, chapters on
  the left, the scene (`stage-scene.tsx`) sticky on the right. Linear: a
  column, the still Block above the chapters; navigation, hint and index are
  `hidden`.
- `chapter-section.tsx`: the text pins below the header for one viewport and
  an `aria-hidden` spacer makes the section `lengthInViewports` tall
  (`to-chapter-scroll-ranges.ts`); the spacer is hidden in the linear layout.
- `use-immersive-layout.ts` (`IMMERSIVE_MEDIA_QUERY`, same query as the
  variant) tells JS when to drive the Block: `readScrollPose` measures the
  Stage once per frame and maps its progress to a pose
  (`to-stage-progress.ts`, `to-block-pose-at-progress.ts`).
- `use-active-chapter.ts` + `watch-active-chapter.ts`: an IntersectionObserver
  on a line across the middle of the viewport sets the active chapter.
- `use-chapter-navigation.ts`: index and ‹ › scroll to a chapter and replace
  the address hash; ‹ › step from the chapter last asked for while the scroll
  is on its way. `chapter-navigation.tsx` announces only after ‹ ›.
- `keep-reading-position.ts` (`reading-position.ts`): when the layout flips
  (resize across 1024px, pointer or reduced-motion change), puts the same
  point of the same chapter back under the middle line. Never uses the hash.

The Block itself lives in `src/features/block/` (`driveBlock` writes its
transform through refs and skips frames while off screen; drag in
`track-block-drag.ts`; keys ← → Home End, Up/Down left to page scroll).

## Invariants

- Window scroll only: no ancestor of the Stage may scroll (`LayoutContent`
  does, so pages put the Stage in a plain `Stack`), or the scene unpins.
- Every chapter is always in the DOM with its `id`, a real heading (`h1` for
  the opening) and its eyebrow number; the index, the navigation and the
  eyebrow share `toChapterNumber` (00 = opening; N = the last chapter's number).
- The Block pose, the active chapter and the reading position use the same
  middle-of-viewport line.
- `pt-header` / `scroll-mt-header` come from the `--spacing-header` token,
  which reads AppShell's measured header height.
- React renders once per chapter crossed or face turned to the front, never
  per frame (`e2e/immersive-performance.spec.ts` counts commits).
