import { CheckboxInput } from '@astryxdesign/core/CheckboxInput'
import { VStack } from '@astryxdesign/core/Layout'
import { Selector } from '@astryxdesign/core/Selector'
import { TextInput } from '@astryxdesign/core/TextInput'
import type { FunctionReturnType } from 'convex/server'
import { useState } from 'react'

import type { api } from '../../../convex/_generated/api'
import { SourceFormDialog } from './source-form-dialog'
import { SOURCES_MESSAGES } from './sources-messages'
import {
  type Cadence,
  EMPTY_NEW_SOURCE_FORM,
  type MetricDefinition,
  type NewSourceForm,
  type SourceKind,
  toMetricDefinitionFromForm,
} from './to-metric-definition-from-form'

type CreateOutcome = FunctionReturnType<typeof api.metrics.createMetric>
type Problem = Extract<CreateOutcome, { kind: 'rejected' }>['problems'][number]

export interface NewSourceDialogProps {
  onClose: () => void
  onCreateMetric: (definition: MetricDefinition) => Promise<CreateOutcome>
}

const MESSAGES = SOURCES_MESSAGES.newSourceDialog

const KIND_OPTIONS = (
  ['npm', 'github-commits', 'github-search', 'manual'] as const
).map((kind) => ({ value: kind, label: MESSAGES.kinds[kind] }))

const CADENCE_OPTIONS = (['daily', 'weekly'] as const).map((cadence) => ({
  value: cadence,
  label: SOURCES_MESSAGES.cadences[cadence],
}))

function isSourceKind(value: string | null): value is SourceKind {
  return KIND_OPTIONS.some((option) => option.value === value)
}

function isCadence(value: string | null): value is Cadence {
  return CADENCE_OPTIONS.some((option) => option.value === value)
}

function toProblemText(problem: Problem) {
  return problem.kind === 'invalid-repo'
    ? MESSAGES.problems['invalid-repo'](problem.repo)
    : MESSAGES.problems[problem.kind]
}

/** The fields only one source kind has. */
function SourceKindFields({
  form,
  onEdit,
}: {
  form: NewSourceForm
  onEdit: (edit: Partial<NewSourceForm>) => void
}) {
  const tokenField = (
    <CheckboxInput
      label={MESSAGES.needsToken}
      value={form.needsToken}
      onChange={(needsToken) => {
        onEdit({ needsToken })
      }}
    />
  )
  switch (form.kind) {
    case 'npm': {
      return (
        <TextInput
          label={MESSAGES.packageName}
          value={form.packageName}
          onChange={(packageName) => {
            onEdit({ packageName })
          }}
        />
      )
    }
    case 'github-commits': {
      return (
        <VStack gap={4}>
          <TextInput
            label={MESSAGES.repos}
            value={form.repos}
            onChange={(repos) => {
              onEdit({ repos })
            }}
          />
          <TextInput
            label={MESSAGES.login}
            value={form.login}
            onChange={(login) => {
              onEdit({ login })
            }}
          />
          {tokenField}
          <CheckboxInput
            label={MESSAGES.showsTotal}
            value={form.showsTotal}
            onChange={(showsTotal) => {
              onEdit({ showsTotal })
            }}
          />
        </VStack>
      )
    }
    case 'github-search': {
      return (
        <VStack gap={4}>
          <TextInput
            label={MESSAGES.query}
            value={form.query}
            onChange={(query) => {
              onEdit({ query })
            }}
          />
          {tokenField}
        </VStack>
      )
    }
    case 'manual': {
      return (
        <CheckboxInput
          label={MESSAGES.isLowerBound}
          value={form.isLowerBound}
          onChange={(isLowerBound) => {
            onEdit({ isLowerBound })
          }}
        />
      )
    }
  }
}

/** Fonti "Nuova fonte": defines a metric and where it comes from. */
export function NewSourceDialog({
  onClose,
  onCreateMetric,
}: NewSourceDialogProps) {
  const [form, setForm] = useState(EMPTY_NEW_SOURCE_FORM)
  const [problems, setProblems] = useState<Problem[]>([])
  const [hasFailed, setHasFailed] = useState(false)
  const editForm = (edit: Partial<NewSourceForm>) => {
    setForm((current) => ({ ...current, ...edit }))
  }

  const submitSource = async () => {
    setHasFailed(false)
    try {
      const outcome = await onCreateMetric(toMetricDefinitionFromForm(form))
      if (outcome.kind === 'created') {
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
    ...problems.map(toProblemText),
  ]

  return (
    <SourceFormDialog
      title={MESSAGES.title}
      cancelLabel={MESSAGES.cancel}
      submitLabel={MESSAGES.submit}
      errors={errors}
      onClose={onClose}
      onSubmit={submitSource}
    >
      <TextInput
        label={MESSAGES.key}
        description={MESSAGES.keyHint}
        value={form.key}
        onChange={(key) => {
          editForm({ key })
        }}
        isRequired
      />
      <TextInput
        label={MESSAGES.label}
        value={form.label}
        onChange={(label) => {
          editForm({ label })
        }}
        isRequired
      />
      <Selector
        label={MESSAGES.kind}
        options={KIND_OPTIONS}
        value={form.kind}
        onChange={(kind) => {
          if (isSourceKind(kind)) {
            editForm({ kind })
          }
        }}
      />
      <SourceKindFields form={form} onEdit={editForm} />
      {form.kind !== 'manual' && (
        <Selector
          label={MESSAGES.cadence}
          options={CADENCE_OPTIONS}
          value={form.cadence}
          onChange={(cadence) => {
            if (isCadence(cadence)) {
              editForm({ cadence })
            }
          }}
        />
      )}
    </SourceFormDialog>
  )
}
