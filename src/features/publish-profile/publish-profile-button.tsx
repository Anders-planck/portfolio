import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/Stack'
import { useMutation } from 'convex/react'
import { useRef, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import { PROFILE_DOCUMENT } from '../../entities/profile/profile-draft'
import {
  PublishOutcomeBanner,
  type PublishState,
} from '../../entities/release/publish-outcome-banner'
import {
  type PublishRequest,
  toPublishRequest,
} from '../../entities/release/publish-request'
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
  const publish = useMutation(api.content.publish)
  const unconfirmed = useRef<PublishRequest | null>(null)
  const [publishState, setPublishState] = useState<PublishState>({
    kind: 'idle',
  })

  const publishDraft = async (draftRevision: number) => {
    const request = toPublishRequest(unconfirmed.current, draftRevision, () =>
      crypto.randomUUID(),
    )
    unconfirmed.current = request
    try {
      const outcome = await publish({
        selection: [{ ...PROFILE_DOCUMENT, revision: request.revision }],
        note: '',
        requestId: request.requestId,
      })
      unconfirmed.current = null
      setPublishState({ kind: 'answered', outcome })
    } catch {
      setPublishState({ kind: 'unconfirmed' })
    }
  }

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
