import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import type { SaveState } from './use-profile-autosave'

const SAVE_COPY = CMS_MESSAGES.save

const TIME_FORMAT = new Intl.DateTimeFormat('it-IT', {
  hour: '2-digit',
  minute: '2-digit',
})

/** The autosave indicator, "Salvato · hh:mm" (resolution 14), announced politely. */
export function SaveStatus({
  saveState,
  onRetry,
}: {
  saveState: SaveState
  onRetry: () => void
}) {
  return (
    <HStack gap={2} align="center">
      <Text type="label" role="status">
        {toSaveStatusText(saveState)}
      </Text>
      {saveState.kind === 'failed' && (
        <Button size="sm" label={SAVE_COPY.retry} onClick={onRetry} />
      )}
    </HStack>
  )
}

function toSaveStatusText(saveState: SaveState) {
  switch (saveState.kind) {
    case 'saved':
      return saveState.savedAt === null
        ? SAVE_COPY.neverSaved
        : SAVE_COPY.saved(TIME_FORMAT.format(saveState.savedAt))
    case 'unsaved':
      return SAVE_COPY.unsaved
    case 'saving':
      return SAVE_COPY.saving
    case 'failed':
      return SAVE_COPY.failed
  }
}
