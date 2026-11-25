import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/Stack'
import { useMutation } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { useRef, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import { PROFILE_DOCUMENT } from '../../entities/profile/profile-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'
import { type PublishRequest, toPublishRequest } from './publish-request'

type PublishOutcome = FunctionReturnType<typeof api.content.publish>

/** The last publish, as the owner sees it. */
type PublishState =
  | { kind: 'idle' }
  | { kind: 'answered'; outcome: PublishOutcome }
  | { kind: 'unconfirmed' }

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
      <PublishStateBanner publishState={publishState} />
    </VStack>
  )
}

function PublishStateBanner({ publishState }: { publishState: PublishState }) {
  if (publishState.kind === 'idle') {
    return null
  }
  if (publishState.kind === 'unconfirmed') {
    return <Banner status="error" title={PUBLISH_COPY.networkError} />
  }
  const { outcome } = publishState
  switch (outcome.status) {
    case 'published':
      return <Banner status="success" title={PUBLISH_COPY.published} />
    case 'scheduled':
      return <Banner status="info" title={PUBLISH_COPY.scheduled} />
    case 'stale':
      return <Banner status="warning" title={PUBLISH_COPY.stale} />
    case 'blocked':
    case 'failed':
      return (
        <Banner
          status="error"
          title={
            outcome.status === 'blocked'
              ? PUBLISH_COPY.blocked
              : PUBLISH_COPY.failed
          }
          description={outcome.findings
            .map((finding) => finding.message)
            .join(' · ')}
        />
      )
  }
}
