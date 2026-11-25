import { useLayoutEffect, useRef } from 'react'

/**
 * Keeps a `#chapter` deep link on its chapter when the layout changes. The
 * server renders the linear layout and the browser jumps to the anchor in
 * it; once the reader's screen and motion settings are known the page may
 * switch to the immersive one, where every chapter is longer, so the jump
 * is made again before the paint. Only on a switch: on the first render the
 * browser (or Back's scroll restoration) has the right position already.
 */
export function useAnchorAcrossLayouts(
  isImmersive: boolean,
  chapterIds: readonly string[],
) {
  const wasImmersiveRef = useRef(isImmersive)

  useLayoutEffect(() => {
    if (wasImmersiveRef.current === isImmersive) {
      return
    }
    wasImmersiveRef.current = isImmersive
    const anchoredChapterId = chapterIds.find(
      (chapterId) => window.location.hash === `#${chapterId}`,
    )
    if (anchoredChapterId !== undefined) {
      document
        .getElementById(anchoredChapterId)
        ?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [isImmersive, chapterIds])
}
