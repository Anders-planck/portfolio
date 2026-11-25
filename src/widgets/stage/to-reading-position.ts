/** Where the reader is: a chapter and how far into it the middle line is. */
export interface ReadingPosition {
  chapterIndex: number
  /** 0 at the chapter's top, 1 at its bottom. */
  shareWithin: number
}

/** A chapter section as `getBoundingClientRect` places it. */
interface SectionPlacement {
  topPx: number
  heightPx: number
}

/**
 * The reading position: the chapter under the middle of the viewport (the
 * line that makes a chapter active) and how far into it that line is.
 * Undefined above or below every chapter.
 */
export function toReadingPosition(
  sections: readonly SectionPlacement[],
  viewportHeightPx: number,
): ReadingPosition | undefined {
  const middleLinePx = viewportHeightPx / 2
  const chapterIndex = sections.findIndex(
    ({ topPx, heightPx }) =>
      topPx <= middleLinePx && middleLinePx < topPx + heightPx,
  )
  const section = sections[chapterIndex]
  if (section === undefined || section.heightPx <= 0) {
    return undefined
  }
  return {
    chapterIndex,
    shareWithin: (middleLinePx - section.topPx) / section.heightPx,
  }
}

/**
 * The window scroll that brings the same point of a chapter back under the
 * middle line, once a layout change has moved and resized the chapter.
 */
export function toScrollYAtReadingPosition({
  shareWithin,
  sectionTopInDocumentPx,
  sectionHeightPx,
  viewportHeightPx,
}: {
  shareWithin: number
  sectionTopInDocumentPx: number
  sectionHeightPx: number
  viewportHeightPx: number
}): number {
  return Math.max(
    0,
    sectionTopInDocumentPx +
      shareWithin * sectionHeightPx -
      viewportHeightPx / 2,
  )
}
