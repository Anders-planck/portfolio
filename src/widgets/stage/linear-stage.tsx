import { Stack } from '@astryxdesign/core/Stack'

import { Block } from '../../features/block/block'
import type { BlockFaces } from '../../features/block/block-face'
import { ChapterSection } from './chapter-section'
import type { StageChapter } from './stage-chapter'

/**
 * The linear layout (ADR 0008): the still Block as a picture, then every
 * chapter as a section in a column. Same chapters, anchors and headings as
 * the immersive layout; nothing is pinned and nothing moves.
 */
export function LinearStage({
  chapters,
  faces,
}: {
  chapters: readonly StageChapter[]
  faces: BlockFaces
}) {
  return (
    <Stack gap={10} paddingBlock={8}>
      <Block faces={faces} />
      {chapters.map((chapter, chapterIndex) => (
        <ChapterSection
          key={chapter.id}
          chapter={chapter}
          chapterIndex={chapterIndex}
        />
      ))}
    </Stack>
  )
}
