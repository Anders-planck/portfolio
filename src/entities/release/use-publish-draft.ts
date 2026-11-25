import { useMutation } from 'convex/react'
import type { FunctionArgs } from 'convex/server'
import { useRef, useState } from 'react'

import { api } from '../../../convex/_generated/api'
import type { PublishState } from './publish-outcome-banner'
import { type PublishRequest, toPublishRequest } from './publish-request'

type ReviewedDraft = FunctionArgs<
  typeof api.content.publish
>['selection'][number]

/** A document of the content store, without the revision. */
export type DraftDocument = Omit<ReviewedDraft, 'revision'>

/**
 * Publishes one document's draft at a revision, now or at `scheduledAt`
 * (epoch ms). A publish whose answer was lost (the network dropped after
 * sending it) is sent again with the same request id, so the backend can
 * never publish twice (DATA-06); a newer revision is a new request.
 */
export function usePublishDraft(document: DraftDocument) {
  const publish = useMutation(api.content.publish)
  const unconfirmed = useRef<PublishRequest | null>(null)
  const [publishState, setPublishState] = useState<PublishState>({
    kind: 'idle',
  })

  const publishDraft = async (revision: number, scheduledAt?: number) => {
    const request = toPublishRequest(unconfirmed.current, revision, () =>
      crypto.randomUUID(),
    )
    unconfirmed.current = request
    try {
      const outcome = await publish({
        selection: [{ ...document, revision: request.revision }],
        note: '',
        requestId: request.requestId,
        ...(scheduledAt === undefined ? {} : { scheduledAt }),
      })
      unconfirmed.current = null
      setPublishState({ kind: 'answered', outcome })
    } catch {
      setPublishState({ kind: 'unconfirmed' })
    }
  }

  return { publishState, publishDraft }
}
