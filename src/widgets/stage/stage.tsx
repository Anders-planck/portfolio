import { Stack } from '@astryxdesign/core/Stack'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { BlockFaces } from '../../features/block/block-face'
import {
  type BlockPose,
  FRONT_BLOCK_POSE,
} from '../../features/block/block-pose'
import { ChapterSection } from './chapter-section'
import { keepReadingPosition } from './keep-reading-position'
import type { StageChapter } from './stage-chapter'
import { StageScene } from './stage-scene'
import { toBlockPoseAtProgress } from './to-block-pose-at-progress'
import { toChapterScrollRanges } from './to-chapter-scroll-ranges'
import { toStageProgress } from './to-stage-progress'
import { useActiveChapter } from './use-active-chapter'
import { useChapterNavigation } from './use-chapter-navigation'
import { useImmersiveLayout } from './use-immersive-layout'

/**
 * The Stage of an immersive page: its chapters (all in the DOM, with
 * anchors and headings) and the Block. Window scroll, never an inner
 * scroller, so Back, `#chapter` links and Page Up/Down, Space and the arrow
 * keys work as on any page (resolution 2). CSS picks the layout (the
 * `immersive:` variant: wide, fine pointer, motion allowed; resolution 7),
 * so the server renders the right geometry; JS adds the moving Block, the
 * active chapter and the chapter navigation.
 */
export function Stage({
  chapters,
  faces,
}: {
  chapters: readonly StageChapter[]
  faces: BlockFaces
}) {
  const isImmersive = useImmersiveLayout()
  const stageRef = useRef<HTMLElement>(null)
  const chapterIds = useMemo(
    () => chapters.map((chapter) => chapter.id),
    [chapters],
  )
  const scrollRanges = useMemo(
    () => toChapterScrollRanges(chapters.map((chapter) => chapter.scrollShare)),
    [chapters],
  )
  const posedChapters = useMemo(
    () =>
      scrollRanges.map((range, chapterIndex) => ({
        ...range,
        blockPose: chapters[chapterIndex]?.blockPose ?? FRONT_BLOCK_POSE,
      })),
    [chapters, scrollRanges],
  )
  const { chaptersRef, activeChapterIndex } = useActiveChapter(chapterIds)
  const { goToChapter, goToAdjacentChapter } = useChapterNavigation(
    chapterIds,
    activeChapterIndex,
  )
  useEffect(() => {
    const chapterSections = chaptersRef.current
    return chapterSections === null
      ? undefined
      : keepReadingPosition(chapterSections)
  }, [chaptersRef])

  const readScrollPose = useCallback((): BlockPose => {
    const stage = stageRef.current
    if (stage === null) {
      return FRONT_BLOCK_POSE
    }
    const { top, height } = stage.getBoundingClientRect()
    const progress = toStageProgress({
      stageTopPx: top,
      stageHeightPx: height,
      viewportHeightPx: window.innerHeight,
    })
    return toBlockPoseAtProgress(progress, posedChapters)
  }, [posedChapters])

  return (
    <Stack
      ref={stageRef}
      gap={10}
      className="immersive:flex-row immersive:items-start immersive:gap-8"
    >
      <StageScene
        chapters={chapters}
        faces={faces}
        activeChapterIndex={activeChapterIndex}
        readScrollPose={isImmersive ? readScrollPose : undefined}
        onGoToChapter={goToChapter}
        onGoToAdjacentChapter={goToAdjacentChapter}
      />
      <Stack
        ref={chaptersRef}
        gap={10}
        className="immersive:w-5/12 immersive:gap-0"
      >
        {chapters.map((chapter, chapterIndex) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            chapterIndex={chapterIndex}
            lengthInViewports={
              scrollRanges[chapterIndex]?.lengthInViewports ?? 1
            }
          />
        ))}
      </Stack>
    </Stack>
  )
}
