import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useCallback, useMemo, useRef } from 'react'

import { Block } from '../../features/block/block'
import type { BlockFaces } from '../../features/block/block-face'
import {
  type BlockPose,
  FRONT_BLOCK_POSE,
} from '../../features/block/block-pose'
import { useMessages } from '../../shared/i18n/use-messages'
import { ChapterIndex } from './chapter-index'
import { ChapterNavigation } from './chapter-navigation'
import { ChapterSection } from './chapter-section'
import type { StageChapter } from './stage-chapter'
import { toBlockPoseAtProgress } from './to-block-pose-at-progress'
import type { ChapterScrollRange } from './to-chapter-scroll-ranges'
import { toStageProgress } from './to-stage-progress'
import { useActiveChapter } from './use-active-chapter'
import { useGoToChapter } from './use-go-to-chapter'

/**
 * The immersive layout (ADR 0008): the chapters scroll in the left column,
 * each as tall as its scroll range, while the scene sticks to the viewport
 * on the right: the Block with the chapter navigation under it, and the
 * chapter index. Scrolling moves the Block through refs; React renders once
 * per chapter crossed.
 */
export function ImmersiveStage({
  chapters,
  chapterIds,
  scrollRanges,
  faces,
}: {
  chapters: readonly StageChapter[]
  chapterIds: readonly string[]
  scrollRanges: readonly ChapterScrollRange[]
  faces: BlockFaces
}) {
  const { immersive } = useMessages()
  const stageRef = useRef<HTMLElement>(null)
  const { chaptersRef, activeChapterIndex } = useActiveChapter(chapterIds)
  const goToChapter = useGoToChapter(chapterIds)
  const posedChapters = useMemo(
    () =>
      scrollRanges.map((range, chapterIndex) => ({
        ...range,
        blockPose: chapters[chapterIndex]?.blockPose ?? FRONT_BLOCK_POSE,
      })),
    [chapters, scrollRanges],
  )
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
    <Stack ref={stageRef} direction="horizontal" align="start" gap={8}>
      <Stack ref={chaptersRef} className="w-5/12">
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
      <Stack
        direction="horizontal"
        align="center"
        gap={8}
        className="sticky top-0 h-svh w-7/12"
      >
        <Stack align="center" gap={4} className="flex-1">
          <Block faces={faces} readScrollPose={readScrollPose} />
          <ChapterNavigation
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            onGoToChapter={goToChapter}
          />
          <Text
            type="supporting"
            color="secondary"
            className="whitespace-nowrap"
          >
            {immersive.stageHint}
          </Text>
        </Stack>
        <ChapterIndex
          chapters={chapters}
          activeChapterIndex={activeChapterIndex}
          onGoToChapter={goToChapter}
        />
      </Stack>
    </Stack>
  )
}
