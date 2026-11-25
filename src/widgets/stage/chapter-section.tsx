import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useId } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import type { StageChapter } from './stage-chapter'
import { toChapterNumber } from './to-chapter-number'

/**
 * One chapter as a real section: its anchor, its eyebrow ("01 / Name",
 * the number the chapter navigation shows too), its heading and content.
 * Given `lengthInViewports` it is an immersive chapter: that tall, with its
 * text pinned in the middle of the viewport while it scrolls.
 */
export function ChapterSection({
  chapter,
  chapterIndex,
  lengthInViewports,
}: {
  chapter: StageChapter
  chapterIndex: number
  lengthInViewports?: number
}) {
  const { immersive } = useMessages()
  const headingId = useId()
  const isPinned = lengthInViewports !== undefined
  const text = (
    <Stack gap={4}>
      <Text type="code" color="secondary">
        {immersive.chapterEyebrow(
          toChapterNumber(chapterIndex),
          chapter.eyebrow,
        )}
      </Text>
      <Heading level={chapterIndex === 0 ? 1 : 2} id={headingId}>
        {chapter.title}
      </Heading>
      {chapter.content}
    </Stack>
  )
  return (
    <Stack
      as="section"
      id={chapter.id}
      aria-labelledby={headingId}
      // An anchor jump lands below the sticky header.
      className="scroll-mt-20"
      {...(isPinned && {
        minHeight: `${String(lengthInViewports * 100)}svh`,
      })}
    >
      {isPinned ? (
        <Stack justify="center" className="sticky top-0 h-svh py-16">
          {text}
        </Stack>
      ) : (
        text
      )}
    </Stack>
  )
}
