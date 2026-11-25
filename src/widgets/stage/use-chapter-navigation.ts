import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { useMotionSettings } from '../../features/motion/use-motion-settings'

/**
 * Going to a chapter from the chapter index or the ‹ › navigation: scrolls
 * its section to the top (smoothly unless motion is reduced, resolution 9)
 * and puts its anchor in the address, replacing the entry, so the link can
 * be shared and Back still leaves the page.
 *
 * ‹ › step from the chapter last asked for while the scroll is still on its
 * way there, so two quick clicks go two chapters. The request is forgotten
 * once that chapter is active or the scrolling ends.
 */
export function useChapterNavigation(
  chapterIds: readonly string[],
  activeChapterIndex: number,
) {
  const navigate = useNavigate()
  const { mode } = useMotionSettings()
  const requestedChapterIndexRef = useRef<number>(undefined)

  useEffect(() => {
    if (requestedChapterIndexRef.current === activeChapterIndex) {
      requestedChapterIndexRef.current = undefined
    }
  }, [activeChapterIndex])

  const goToChapter = useCallback(
    (chapterIndex: number) => {
      const chapterId = chapterIds[chapterIndex]
      if (chapterId === undefined) {
        return
      }
      requestedChapterIndexRef.current = chapterIndex
      window.addEventListener(
        'scrollend',
        () => {
          requestedChapterIndexRef.current = undefined
        },
        { once: true },
      )
      document.getElementById(chapterId)?.scrollIntoView({
        behavior: mode === 'reduced' ? 'instant' : 'smooth',
        block: 'start',
      })
      void navigate({
        to: '.',
        hash: chapterId,
        replace: true,
        resetScroll: false,
        hashScrollIntoView: false,
      })
    },
    [chapterIds, navigate, mode],
  )

  /** Goes `step` chapters on (or back); returns where to, if anywhere. */
  const goToAdjacentChapter = useCallback(
    (step: number): number | undefined => {
      const fromChapterIndex =
        requestedChapterIndexRef.current ?? activeChapterIndex
      const chapterIndex = fromChapterIndex + step
      if (chapterIds[chapterIndex] === undefined) {
        return undefined
      }
      goToChapter(chapterIndex)
      return chapterIndex
    },
    [chapterIds, activeChapterIndex, goToChapter],
  )

  return { goToChapter, goToAdjacentChapter }
}
