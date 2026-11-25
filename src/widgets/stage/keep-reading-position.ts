import { IMMERSIVE_MEDIA_QUERY } from './immersive-media-query'
import {
  type ReadingPosition,
  toReadingPosition,
  toScrollYAtReadingPosition,
} from './to-reading-position'

/**
 * Keeps the reader on the same point of the same chapter when the layout
 * switches between linear and immersive (a resize across 1024px, a change of
 * pointer or of reduced motion): every chapter changes height, so the old
 * scroll would land elsewhere. Remembers the reading position after each
 * scroll (once per frame) and restores it when the media query flips. The
 * address hash plays no part, so a stale `#chapter` is never re-jumped to.
 * Returns the cleanup.
 */
export function keepReadingPosition(chapters: HTMLElement): () => void {
  const layoutQuery = window.matchMedia(IMMERSIVE_MEDIA_QUERY)
  let pendingFrameId = 0
  let position: ReadingPosition | undefined

  const readSections = () => Array.from(chapters.children)
  const rememberPosition = () => {
    pendingFrameId = 0
    position = toReadingPosition(
      readSections().map((section) => {
        const { top, height } = section.getBoundingClientRect()
        return { topPx: top, heightPx: height }
      }),
      window.innerHeight,
    )
  }
  const scheduleRemember = () => {
    if (pendingFrameId === 0) {
      pendingFrameId = requestAnimationFrame(rememberPosition)
    }
  }
  const restorePosition = () => {
    const section = position && readSections()[position.chapterIndex]
    if (position === undefined || section === undefined) {
      return
    }
    const { top, height } = section.getBoundingClientRect()
    window.scrollTo({
      top: toScrollYAtReadingPosition({
        shareWithin: position.shareWithin,
        sectionTopInDocumentPx: top + window.scrollY,
        sectionHeightPx: height,
        viewportHeightPx: window.innerHeight,
      }),
      behavior: 'instant',
    })
  }

  rememberPosition()
  window.addEventListener('scroll', scheduleRemember, { passive: true })
  layoutQuery.addEventListener('change', restorePosition)
  return () => {
    window.removeEventListener('scroll', scheduleRemember)
    layoutQuery.removeEventListener('change', restorePosition)
    cancelAnimationFrame(pendingFrameId)
  }
}
