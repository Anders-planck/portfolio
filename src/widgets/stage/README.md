# Stage (immersive engine)

The engine of every immersive page (GLOSSARY): Home, Lavori, Percorso and the
project pages give it their chapters and Block faces as data (`StageChapter`,
`BlockFaces`); the demo at `/demo` runs it on placeholder copy.

## Flow

- `stage.tsx` picks the layout with `useImmersiveLayout` (wide screen, fine
  pointer, motion allowed; ADR 0008, resolution 7) and turns scroll shares into
  ranges (`to-chapter-scroll-ranges.ts`).
- `linear-stage.tsx`: the still Block as a picture, then every chapter as a
  section. This is also what the server renders and the first client render
  shows, before the reader's settings are known.
- `immersive-stage.tsx`: chapters in the left column, each `lengthInViewports`
  tall with its text pinned; the scene (Block, `ChapterNavigation`, hint,
  `ChapterIndex`) sticks on the right. `readScrollPose` measures the Stage
  once per frame and maps its progress to a Block pose
  (`to-stage-progress.ts`, `to-block-pose-at-progress.ts`).
- `use-active-chapter.ts` + `watch-active-chapter.ts`: an IntersectionObserver
  on a line across the middle of the viewport sets the active chapter.
- `use-go-to-chapter.ts`: index and ‹ › scroll to a chapter and replace the
  address hash. `use-anchor-across-layouts.ts`: re-jumps to `#chapter` when
  the layout switches after hydration.

The Block itself lives in `src/features/block/` (`driveBlock` writes its
transform through refs; drag in `track-block-drag.ts`).

## Invariants

- Window scroll only: no ancestor of the Stage may scroll (`LayoutContent`
  does, so pages put the Stage in a plain `Stack`), or the scene unpins.
- Every chapter is always in the DOM with its `id`, a real heading (`h1` for
  the opening) and its eyebrow number; the index, the navigation and the
  eyebrow share `toChapterNumber` (00 = opening; N = the last chapter's number).
- The Block pose and the active chapter use the same middle-of-viewport line.
- React renders once per chapter crossed or face turned to the front, never
  per frame (`e2e/immersive-performance.spec.ts` counts commits).
