/**
 * The line across the middle of the viewport: a chapter is active while it
 * covers it. The Block pose uses the same line (`toStageProgress`).
 */
const MIDDLE_LINE_ROOT_MARGIN = '-50% 0px -50% 0px'

/**
 * Calls `onActiveChapter` with the index of the chapter section that covers
 * the middle of the viewport, each time another one does. An
 * IntersectionObserver does the watching, so scrolling runs no code of ours
 * between two chapters. Returns the cleanup.
 */
export function watchActiveChapter(
  sections: readonly Element[],
  onActiveChapter: (chapterIndex: number) => void,
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.find((entry) => entry.isIntersecting)
      if (entering !== undefined) {
        onActiveChapter(sections.indexOf(entering.target))
      }
    },
    { rootMargin: MIDDLE_LINE_ROOT_MARGIN, threshold: 0 },
  )
  sections.forEach((section) => {
    observer.observe(section)
  })
  return () => {
    observer.disconnect()
  }
}
