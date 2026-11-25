import type { ISODateString } from '@astryxdesign/core/Calendar'
import { DateInput } from '@astryxdesign/core/DateInput'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import type { FunctionArgs, FunctionReturnType } from 'convex/server'
import { useState } from 'react'

import type { api } from '../../../convex/_generated/api'
import { SourceFormDialog } from './source-form-dialog'
import { SOURCES_MESSAGES } from './sources-messages'

type ManualCount = FunctionArgs<typeof api.metrics.recordManualCount>
type ManualCountOutcome = FunctionReturnType<
  typeof api.metrics.recordManualCount
>
type Problem = Extract<
  ManualCountOutcome,
  { kind: 'rejected' }
>['problems'][number]

export interface ManualCountDialogProps {
  metricKey: string
  metricLabel: string
  onClose: () => void
  onRecordManualCount: (count: ManualCount) => Promise<ManualCountOutcome>
}

const MESSAGES = SOURCES_MESSAGES.manualCount

function isIsoDateString(value: string): value is ISODateString {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/** Today as `YYYY-MM-DD` (UTC), the latest day a count can have been made. */
function toTodayIsoDate(): ISODateString {
  const today = new Date().toISOString().slice(0, 10)
  if (!isIsoDateString(today)) {
    throw new Error(`Unexpected ISO date: ${today}`)
  }
  return today
}

/** `YYYY-MM-DD` as the epoch ms of that day at midnight UTC. */
function toEpochMsFromIsoDate(isoDate: ISODateString) {
  return Date.parse(`${isoDate}T00:00:00Z`)
}

/** Fonti: records a manual count with its evidence (ADR 0004). */
export function ManualCountDialog({
  metricKey,
  metricLabel,
  onClose,
  onRecordManualCount,
}: ManualCountDialogProps) {
  const today = toTodayIsoDate()
  const [value, setValue] = useState<number | null>(null)
  const [countedOn, setCountedOn] = useState(today)
  const [evidence, setEvidence] = useState('')
  const [problems, setProblems] = useState<Problem[]>([])
  const [hasFailed, setHasFailed] = useState(false)

  const submitCount = async () => {
    setHasFailed(false)
    if (value === null) {
      setProblems([{ kind: 'invalid-value' }])
      return
    }
    try {
      const outcome = await onRecordManualCount({
        key: metricKey,
        value,
        countedAt: toEpochMsFromIsoDate(countedOn),
        evidence,
      })
      if (outcome.kind === 'recorded') {
        onClose()
        return
      }
      setProblems(outcome.problems)
    } catch {
      setHasFailed(true)
    }
  }
  const errors = [
    ...(hasFailed ? [MESSAGES.failed] : []),
    ...problems.map((problem) => MESSAGES.problems[problem.kind]),
  ]

  return (
    <SourceFormDialog
      title={MESSAGES.title}
      subtitle={metricLabel}
      cancelLabel={MESSAGES.cancel}
      submitLabel={MESSAGES.submit}
      errors={errors}
      onClose={onClose}
      onSubmit={submitCount}
    >
      <NumberInput
        label={MESSAGES.value}
        value={value}
        onChange={setValue}
        isRequired
      />
      <DateInput
        label={MESSAGES.countedOn}
        value={countedOn}
        max={today}
        onChange={(isoDate) => {
          setCountedOn(isoDate ?? today)
        }}
        isRequired
      />
      <TextArea
        label={MESSAGES.evidence}
        description={MESSAGES.evidenceHint}
        value={evidence}
        onChange={setEvidence}
        isRequired
      />
      <Text type="supporting" color="secondary">
        {MESSAGES.expiryHint}
      </Text>
    </SourceFormDialog>
  )
}
