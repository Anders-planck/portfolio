import { Button } from '@astryxdesign/core/Button'
import {
  DateTimeInput,
  type ISODateTimeString,
} from '@astryxdesign/core/DateTimeInput'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { useState } from 'react'

import { PublishOutcomeBanner } from '../../entities/release/publish-outcome-banner'
import { usePublishDraft } from '../../entities/release/use-publish-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { toScheduledAtFromDateTime } from './to-scheduled-at-from-date-time'

const RELEASE_COPY = CMS_MESSAGES.release

/**
 * Publishes a note's draft at `revision` now, or schedules it with a date
 * and time picker (the content store's scheduled release). Busy while a
 * publish runs; a publish whose answer was lost is sent again with the same
 * request id, so it can never publish twice (DATA-06).
 */
export function PublishNoteControls({
  noteKey,
  revision,
  isDisabled,
}: {
  noteKey: string
  revision: number
  isDisabled: boolean
}) {
  const { publishState, publishDraft } = usePublishDraft({
    collection: 'note',
    key: noteKey,
  })
  const [dateTime, setDateTime] = useState<ISODateTimeString | undefined>(
    undefined,
  )
  const scheduledAt = toScheduledAtFromDateTime(dateTime, Date.now())

  return (
    <VStack gap={3}>
      <Button
        variant="primary"
        label={RELEASE_COPY.publishNow}
        isDisabled={isDisabled}
        clickAction={() => publishDraft(revision)}
      />
      <HStack gap={2} align="end" wrap="wrap">
        <DateTimeInput
          label={RELEASE_COPY.scheduleAt}
          value={dateTime}
          onChange={setDateTime}
          {...(scheduledAt.kind === 'past'
            ? { status: { type: 'error', message: RELEASE_COPY.schedulePast } }
            : {})}
        />
        <Button
          label={RELEASE_COPY.scheduleAction}
          isDisabled={isDisabled || scheduledAt.kind !== 'future'}
          clickAction={() =>
            scheduledAt.kind === 'future'
              ? publishDraft(revision, scheduledAt.scheduledAt)
              : Promise.resolve()
          }
        />
      </HStack>
      <PublishOutcomeBanner publishState={publishState} />
    </VStack>
  )
}
