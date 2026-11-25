import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { useMessages } from '../../shared/i18n/use-messages'
import type { StageChapter } from './stage-chapter'
import { toChapterNumber } from './to-chapter-number'

/**
 * The control under the Block (resolution 3): ‹ previous, the active
 * chapter as "n / N · name" with the eyebrow's numbers (00 = opening, N =
 * the last chapter), next ›. At either end the button stays focusable but
 * is marked unavailable, so focus never drops to the page.
 */
export function ChapterNavigation({
  chapters,
  activeChapterIndex,
  onGoToChapter,
}: {
  chapters: readonly Pick<StageChapter, 'id' | 'eyebrow'>[]
  activeChapterIndex: number
  onGoToChapter: (chapterIndex: number) => void
}) {
  const { immersive } = useMessages()
  const activeChapter = chapters[activeChapterIndex]
  const lastChapterIndex = chapters.length - 1
  const isFirst = activeChapterIndex <= 0
  const isLast = activeChapterIndex >= lastChapterIndex
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
        aria-disabled={isFirst}
        onClick={() => {
          onGoToChapter(activeChapterIndex - 1)
        }}
      />
      <Text aria-live="polite" weight="semibold" className="whitespace-nowrap">
        {toChapterNumber(activeChapterIndex)} /{' '}
        {toChapterNumber(lastChapterIndex)} · {activeChapter?.eyebrow}
      </Text>
      <Button
        label={immersive.nextChapter}
        isIconOnly
        icon={<Icon icon="chevronRight" />}
        variant="ghost"
        aria-disabled={isLast}
        onClick={() => {
          onGoToChapter(activeChapterIndex + 1)
        }}
      />
    </Stack>
  )
}
