import { type RefObject, useEffect, useState } from 'react'

/**
 * How far the reader is through `articleRef`, in whole percent: 0 while its
 * top is below the top of the viewport, 100 once its end is in view. Scroll
 * events are read once per frame, and React only hears of a change of a
 * whole percent (at most a hundred renders over a note, never one a frame).
 */
export function useReadingProgress(articleRef: RefObject<HTMLElement | null>) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    let frame: number | null = null
    const measure = () => {
      frame = null
      const article = articleRef.current
      if (article !== null) {
        setPercent(
          toReadPercent(article.getBoundingClientRect(), window.innerHeight),
        )
      }
    }
    const scheduleMeasure = () => {
      frame ??= window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [articleRef])

  return percent
}

/** The read share of an article from its box and the viewport height. */
export function toReadPercent(
  box: { top: number; height: number },
  viewportHeight: number,
): number {
  const scrollable = box.height - viewportHeight
  if (scrollable <= 0) {
    return box.top + box.height <= viewportHeight ? 100 : 0
  }
  const read = Math.min(Math.max(-box.top / scrollable, 0), 1)
  return Math.round(read * 100)
}
