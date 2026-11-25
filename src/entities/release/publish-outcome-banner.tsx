import { Banner } from '@astryxdesign/core/Banner'
import type { FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

export type PublishOutcome = FunctionReturnType<typeof api.content.publish>

/** The last publish, as the owner sees it. */
export type PublishState =
  | { kind: 'idle' }
  | { kind: 'answered'; outcome: PublishOutcome }
  | { kind: 'unconfirmed' }

const PUBLISH_COPY = CMS_MESSAGES.publish

/** What the last publish of a draft did: live, scheduled, stale, blocked, lost. */
export function PublishOutcomeBanner({
  publishState,
}: {
  publishState: PublishState
}) {
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
      // A finding's message is the rules engine's owner-facing copy (in
      // Italian, PLAN: rules engine), so it is shown as it comes.
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
