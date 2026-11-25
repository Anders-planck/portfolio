import { Step, Stepper } from '@astryxdesign/core/Stepper'

import { useMessages } from '../../shared/i18n/use-messages'
import type { StageChapter } from './stage-chapter'
import { toChapterNumber } from './to-chapter-number'

/**
 * The Chapter index on the right of an immersive page (Astryx Stepper):
 * every chapter with its number (the eyebrow’s), the active one marked `aria-current`. A
 * step goes to its chapter.
 */
export function ChapterIndex({
  chapters,
  activeChapterIndex,
  onGoToChapter,
}: {
  chapters: readonly Pick<StageChapter, 'id' | 'eyebrow'>[]
  activeChapterIndex: number
  onGoToChapter: (chapterIndex: number) => void
}) {
  const { immersive } = useMessages()
  return (
    <Stepper
      orientation="vertical"
      density="compact"
      label={immersive.chapterIndexLabel}
      activeStep={activeChapterIndex}
      onStepClick={onGoToChapter}
    >
      {chapters.map((chapter, chapterIndex) => (
        <Step
          key={chapter.id}
          step={chapterIndex}
          // The number sits in the label, not in a custom indicator, so the
          // step button's accessible name contains all its visible text.
          label={`${toChapterNumber(chapterIndex)} ${chapter.eyebrow}`}
          indicator="none"
        />
      ))}
    </Stepper>
  )
}
