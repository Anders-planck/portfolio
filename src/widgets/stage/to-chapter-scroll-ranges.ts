/** Where a chapter sits on the scroll of its Stage. */
export interface ChapterScrollRange {
  /** How long the chapter scrolls, in viewport heights (at least 1). */
  lengthInViewports: number
  /** Share of the Stage's length where the chapter starts (0–1). */
  scrollRangeStart: number
  /** Share of the Stage's length where the chapter ends (0–1). */
  scrollRangeEnd: number
}

/** A chapter shorter than the viewport could not pin its text. */
const MIN_LENGTH_IN_VIEWPORTS = 1

function isUsableShare(scrollShare: number): boolean {
  return Number.isFinite(scrollShare) && scrollShare > 0
}

/**
 * The scroll range of each chapter from its scroll share (the pacing the
 * owner sets per chapter, user story 34). An average share scrolls one
 * viewport; a larger one scrolls longer in proportion. A share that is not a
 * positive number counts as an average one.
 */
export function toChapterScrollRanges(
  scrollShares: readonly number[],
): ChapterScrollRange[] {
  const usableShares = scrollShares.filter(isUsableShare)
  const averageShare =
    usableShares.length === 0
      ? 1
      : usableShares.reduce((sum, share) => sum + share, 0) /
        usableShares.length
  const lengths = scrollShares.map((scrollShare) =>
    isUsableShare(scrollShare)
      ? Math.max(MIN_LENGTH_IN_VIEWPORTS, scrollShare / averageShare)
      : MIN_LENGTH_IN_VIEWPORTS,
  )
  const totalLength = lengths.reduce((sum, length) => sum + length, 0)
  return lengths.reduce<ChapterScrollRange[]>((ranges, lengthInViewports) => {
    const scrollRangeStart = ranges.at(-1)?.scrollRangeEnd ?? 0
    const isLast = ranges.length === lengths.length - 1
    return [
      ...ranges,
      {
        lengthInViewports,
        scrollRangeStart,
        // The last range ends at exactly 1, whatever the rounding before it.
        scrollRangeEnd: isLast
          ? 1
          : scrollRangeStart + lengthInViewports / totalLength,
      },
    ]
  }, [])
}
