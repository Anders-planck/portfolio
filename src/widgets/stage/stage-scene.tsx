import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { Block } from '../../features/block/block'
import type { BlockFaces } from '../../features/block/block-face'
import type { BlockPose } from '../../features/block/block-pose'
import { useMessages } from '../../shared/i18n/use-messages'
import { ChapterIndex } from './chapter-index'
import { ChapterNavigation } from './chapter-navigation'
import type { StageChapter } from './stage-chapter'

/**
 * The scene of a Stage: the Block, and in the immersive layout (CSS,
 * `immersive:`) the chapter navigation and hint under it and the chapter
 * index beside it, all sticking to the viewport on the right. In the linear
 * layout only the still Block shows, above the chapters.
 */
export function StageScene({
  chapters,
  faces,
  activeChapterIndex,
  readScrollPose,
  onGoToChapter,
  onGoToAdjacentChapter,
}: {
  chapters: readonly Pick<StageChapter, 'id' | 'eyebrow'>[]
  faces: BlockFaces
  activeChapterIndex: number
  /** Given only once JS knows the layout is immersive: the Block moves. */
  readScrollPose: (() => BlockPose) | undefined
  onGoToChapter: (chapterIndex: number) => void
  onGoToAdjacentChapter: (step: number) => number | undefined
}) {
  const { immersive } = useMessages()
  return (
    <Stack
      direction="horizontal"
      align="center"
      justify="center"
      className="immersive:sticky immersive:top-0 immersive:order-last immersive:h-svh immersive:w-7/12 immersive:gap-8 immersive:pt-header"
    >
      <Stack align="center" gap={4} className="immersive:flex-1">
        <Block faces={faces} readScrollPose={readScrollPose} />
        <Stack align="center" gap={4} className="hidden immersive:flex">
          <ChapterNavigation
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            onGoToAdjacentChapter={onGoToAdjacentChapter}
          />
          <Text
            type="supporting"
            color="secondary"
            className="whitespace-nowrap"
          >
            {immersive.stageHint}
          </Text>
        </Stack>
      </Stack>
      <Stack className="hidden immersive:flex">
        <ChapterIndex
          chapters={chapters}
          activeChapterIndex={activeChapterIndex}
          onGoToChapter={onGoToChapter}
        />
      </Stack>
    </Stack>
  )
}
