/**
 * Where ‹ › lead: `step` chapters from the chapter last asked for while the
 * scroll is still on its way there (so two quick clicks go two chapters),
 * else from the active one. Undefined past either end.
 */
export function toAdjacentChapterIndex({
  requestedChapterIndex,
  activeChapterIndex,
  chapterCount,
  step,
}: {
  requestedChapterIndex: number | undefined
  activeChapterIndex: number
  chapterCount: number
  step: number
}): number | undefined {
  const chapterIndex = (requestedChapterIndex ?? activeChapterIndex) + step
  return chapterIndex >= 0 && chapterIndex < chapterCount
    ? chapterIndex
    : undefined
}
