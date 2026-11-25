import { useMemo } from 'react'

import type { BlockFaces } from '../../features/block/block-face'
import { ImmersiveStage } from './immersive-stage'
import { LinearStage } from './linear-stage'
import type { StageChapter } from './stage-chapter'
import { toChapterScrollRanges } from './to-chapter-scroll-ranges'
import { useAnchorAcrossLayouts } from './use-anchor-across-layouts'
import { useImmersiveLayout } from './use-immersive-layout'

/**
 * The Stage of an immersive page: its chapters (all in the DOM, with
 * anchors and headings) and the Block. Window scroll, never an inner
 * scroller, so Back, `#chapter` links and Page Up/Down, Space and the arrow
 * keys work as on any page (resolution 2). Immersive on a wide screen with
 * a fine pointer and motion allowed, linear otherwise (resolution 7).
 */
export function Stage({
  chapters,
  faces,
}: {
  chapters: readonly StageChapter[]
  faces: BlockFaces
}) {
  const isImmersive = useImmersiveLayout()
  const chapterIds = useMemo(
    () => chapters.map((chapter) => chapter.id),
    [chapters],
  )
  const scrollRanges = useMemo(
    () => toChapterScrollRanges(chapters.map((chapter) => chapter.scrollShare)),
    [chapters],
  )
  useAnchorAcrossLayouts(isImmersive, chapterIds)

  if (!isImmersive) {
    return <LinearStage chapters={chapters} faces={faces} />
  }
  return (
    <ImmersiveStage
      chapters={chapters}
      chapterIds={chapterIds}
      scrollRanges={scrollRanges}
      faces={faces}
    />
  )
}
