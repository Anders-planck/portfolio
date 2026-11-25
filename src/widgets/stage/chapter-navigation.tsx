import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden'
import { useState } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import type { StageChapter } from './stage-chapter'
import { toChapterNumber } from './to-chapter-number'

/**
 * The control under the Block (resolution 3): ‹ previous, the active
 * chapter as "n / N · name" with the eyebrow's numbers (00 = opening, N =
 * the last chapter), next ›. At either end the button stays focusable but
 * is marked unavailable, so focus never drops to the page. Only a ‹ ›
 * activation is announced; scrolling past chapters is not.
 */
export function ChapterNavigation({
  chapters,
  activeChapterIndex,
  onGoToAdjacentChapter,
}: {
  chapters: readonly Pick<StageChapter, 'id' | 'eyebrow'>[]
  activeChapterIndex: number
  /** Goes `step` chapters on or back; returns where to, if anywhere. */
  onGoToAdjacentChapter: (step: number) => number | undefined
}) {
  const { immersive } = useMessages()
  const [announcement, setAnnouncement] = useState('')
  const lastChapterIndex = chapters.length - 1
  const toPosition = (chapterIndex: number) =>
    immersive.chapterPosition(
      toChapterNumber(chapterIndex),
      toChapterNumber(lastChapterIndex),
      chapters[chapterIndex]?.eyebrow ?? '',
    )
  const goBy = (step: number) => {
    const chapterIndex = onGoToAdjacentChapter(step)
    if (chapterIndex !== undefined) {
      setAnnouncement(toPosition(chapterIndex))
    }
  }

  return (
    <Stack
      role="group"
      aria-label={immersive.chapterNavigationLabel}
      direction="horizontal"
      align="center"
      gap={3}
      padding={1}
      className="rounded-full border border-border bg-surface"
    >
      <Button
        label={immersive.previousChapter}
        isIconOnly
        icon={<Icon icon="chevronLeft" />}
        variant="ghost"
        aria-disabled={activeChapterIndex <= 0}
        onClick={() => {
          goBy(-1)
        }}
      />
      <Text weight="semibold" className="whitespace-nowrap">
        {toPosition(activeChapterIndex)}
      </Text>
      <Button
        label={immersive.nextChapter}
        isIconOnly
        icon={<Icon icon="chevronRight" />}
        variant="ghost"
        aria-disabled={activeChapterIndex >= lastChapterIndex}
        onClick={() => {
          goBy(1)
        }}
      />
      <VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
    </Stack>
  )
}
