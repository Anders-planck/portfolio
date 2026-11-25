import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

import { useMotionSettings } from '../../features/motion/use-motion-settings'

/**
 * Goes to a chapter from the chapter index or the ‹ › navigation: scrolls
 * its section to the top (smoothly unless motion is reduced, resolution 9)
 * and puts its anchor in the address, replacing the entry, so the link can
 * be shared and Back still leaves the page. An index outside the chapters
 * does nothing.
 */
export function useGoToChapter(chapterIds: readonly string[]) {
  const navigate = useNavigate()
  const { mode } = useMotionSettings()

  return useCallback(
    (chapterIndex: number) => {
      const chapterId = chapterIds[chapterIndex]
      if (chapterId === undefined) {
        return
      }
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
}
