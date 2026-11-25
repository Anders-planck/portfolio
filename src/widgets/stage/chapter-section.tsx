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
 * In the immersive layout (CSS, `immersive:`) its text pins below the
 * header for one viewport and a spacer makes the section
 * `lengthInViewports` tall; in the linear layout the spacer is not there.
 */
export function ChapterSection({
  chapter,
  chapterIndex,
  lengthInViewports,
}: {
  chapter: StageChapter
  chapterIndex: number
  lengthInViewports: number
}) {
  const { immersive } = useMessages()
  const headingId = useId()
  const spacerLengthInViewports = lengthInViewports - 1
  return (
    <Stack
      as="section"
      id={chapter.id}
      aria-labelledby={headingId}
      className="scroll-mt-header immersive:scroll-mt-0"
    >
      <Stack
        gap={4}
        className="immersive:sticky immersive:top-0 immersive:h-svh immersive:justify-center immersive:pt-header immersive:pb-8"
      >
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
      {spacerLengthInViewports > 0 && (
        <Stack
          aria-hidden="true"
          height={`${String(spacerLengthInViewports * 100)}svh`}
          className="hidden immersive:flex"
        >
          {null}
        </Stack>
      )}
    </Stack>
  )
}
