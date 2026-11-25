import { useEffect, useRef, useState } from 'react'

import { watchActiveChapter } from './watch-active-chapter'

/**
 * The chapter that covers the middle of the viewport. Put `chaptersRef` on
 * the element whose children are the chapter sections, in order. State
 * changes once per chapter crossed, never per frame.
 */
export function useActiveChapter(chapterIds: readonly string[]) {
  const chaptersRef = useRef<HTMLElement>(null)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const chapterKey = chapterIds.join(' ')

  useEffect(() => {
    const chapters = chaptersRef.current
    if (chapters === null) {
      return undefined
    }
    return watchActiveChapter(
      Array.from(chapters.children),
      setActiveChapterIndex,
    )
  }, [chapterKey])

  return { chaptersRef, activeChapterIndex }
}
