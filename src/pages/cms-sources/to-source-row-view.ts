import type { FunctionReturnType } from 'convex/server'

import type { api } from '../../../convex/_generated/api'
import { SOURCES_MESSAGES } from './sources-messages'

/**
 * How one metric reads in the Fonti table: the words for its source, its
 * refresh and its status. Pure, so the page only lays the row out.
 */

export type SourcesOverview = FunctionReturnType<
  typeof api.metrics.getSourcesOverview
>
export type SourceRow = SourcesOverview['metrics'][number]
type Status = SourceRow['status']
type FailureReason = Extract<Status, { kind: 'failing' }>['reason']

type StatusTone = 'success' | 'warning' | 'error' | 'neutral'

export interface SourceRowView {
  value: string
  kind: string
  origin: string
  cadence: string
  status: { tone: StatusTone; label: string; detail: string | null }
}

const CMS_DATE_FORMAT = new Intl.DateTimeFormat('it', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Rome',
})

/** A CMS date, as in "23 nov 2026". */
function formatCmsDate(epochMs: number) {
  return CMS_DATE_FORMAT.format(epochMs)
}

function toKindLabel(source: SourceRow['source']) {
  const { kinds } = SOURCES_MESSAGES
  switch (source.kind) {
    case 'npm': {
      return kinds.npm
    }
    case 'github-commits':
    case 'github-search': {
      return source.needsToken ? kinds.githubWithToken : kinds.github
    }
    case 'manual': {
      return kinds.manual
    }
  }
}

function toOrigin(row: SourceRow) {
  const { origins } = SOURCES_MESSAGES
  switch (row.source.kind) {
    case 'npm': {
      return origins.npm(row.source.packageName)
    }
    case 'github-commits': {
      return origins.commits(row.source.repos.join(', '))
    }
    case 'github-search': {
      return origins.search(row.source.query)
    }
    case 'manual': {
      return row.verifiedAt === null || row.evidence === null
        ? origins.manualNever
        : origins.manual(formatCmsDate(row.verifiedAt), row.evidence)
    }
  }
}

function toFailureText(reason: FailureReason) {
  const { failureReasons } = SOURCES_MESSAGES
  return reason.kind === 'http'
    ? failureReasons.http(String(reason.status))
    : failureReasons[reason.kind]
}

function toStatusView(status: Status): SourceRowView['status'] {
  const { statuses } = SOURCES_MESSAGES
  switch (status.kind) {
    case 'ok': {
      return { tone: 'success', label: statuses.ok, detail: null }
    }
    case 'awaiting-reading': {
      return { tone: 'neutral', label: statuses.awaitingReading, detail: null }
    }
    case 'failing': {
      return {
        tone: 'error',
        label: statuses.failing(formatCmsDate(status.failedAt)),
        detail: toFailureText(status.reason),
      }
    }
    case 'expired': {
      return { tone: 'warning', label: statuses.expired, detail: null }
    }
  }
}

export function toSourceRowViewFromRow(row: SourceRow): SourceRowView {
  return {
    // Never a placeholder figure: no verified reading reads "nessun valore".
    value: row.display ?? SOURCES_MESSAGES.noValue,
    kind: toKindLabel(row.source),
    origin: toOrigin(row),
    cadence:
      row.source.kind === 'manual'
        ? SOURCES_MESSAGES.cadences.manual
        : SOURCES_MESSAGES.cadences[row.source.cadence],
    status: toStatusView(row.status),
  }
}
