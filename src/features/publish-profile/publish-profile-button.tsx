import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/Stack'

import { PROFILE_DOCUMENT } from '../../entities/profile/profile-draft'
import { PublishOutcomeBanner } from '../../entities/release/publish-outcome-banner'
import { usePublishDraft } from '../../entities/release/use-publish-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const PUBLISH_COPY = CMS_MESSAGES.publish

/**
 * Publishes the Profile draft now, at `revision` (null: nothing saved yet).
 * The button stays busy while a publish runs, and a publish whose answer was
 * lost is retried with the same request id (DATA-06).
 */
export function PublishProfileButton({
  revision,
  isDisabled,
}: {
  revision: number | null
  isDisabled: boolean
}) {
  const { publishState, publishDraft } = usePublishDraft(PROFILE_DOCUMENT)

  return (
    <VStack gap={3}>
      <Button
        variant="primary"
        label={PUBLISH_COPY.action}
        isDisabled={isDisabled || revision === null}
        clickAction={async () => {
          if (revision !== null) {
            await publishDraft(revision)
          }
        }}
      />
      <PublishOutcomeBanner publishState={publishState} />
    </VStack>
  )
}
