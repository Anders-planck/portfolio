import type { FunctionArgs } from 'convex/server'

import type { internal } from '../../../convex/_generated/api'

/**
 * The "Nuova fonte" form and the metric definition it creates (pure). The
 * form holds every field of every source kind; only the chosen kind's fields
 * go into the definition. The server checks the values.
 */

export type MetricDefinition = FunctionArgs<
  typeof internal.metrics.createMetric
>
export type SourceKind = MetricDefinition['source']['kind']
export type Cadence = Extract<
  MetricDefinition['source'],
  { cadence: unknown }
>['cadence']

export interface NewSourceForm {
  key: string
  label: string
  kind: SourceKind
  packageName: string
  /** Repositories as typed: `owner/name`, separated by commas. */
  repos: string
  login: string
  query: string
  needsToken: boolean
  showsTotal: boolean
  isLowerBound: boolean
  cadence: Cadence
}

export const EMPTY_NEW_SOURCE_FORM: NewSourceForm = {
  key: '',
  label: '',
  kind: 'npm',
  packageName: '',
  repos: '',
  login: '',
  query: '',
  needsToken: false,
  showsTotal: false,
  isLowerBound: false,
  cadence: 'daily',
}

function toRepoList(repos: string) {
  return repos
    .split(',')
    .map((repo) => repo.trim())
    .filter((repo) => repo !== '')
}

function toSource(form: NewSourceForm): MetricDefinition['source'] {
  const { cadence, needsToken } = form
  switch (form.kind) {
    case 'npm': {
      return { kind: 'npm', packageName: form.packageName.trim(), cadence }
    }
    case 'github-commits': {
      return {
        kind: 'github-commits',
        repos: toRepoList(form.repos),
        login: form.login.trim(),
        needsToken,
        cadence,
      }
    }
    case 'github-search': {
      return {
        kind: 'github-search',
        query: form.query.trim(),
        needsToken,
        cadence,
      }
    }
    case 'manual': {
      return { kind: 'manual' }
    }
  }
}

function toFormat(form: NewSourceForm): MetricDefinition['format'] {
  if (form.kind === 'github-commits' && form.showsTotal) {
    return 'count-of-total'
  }
  if (form.kind === 'manual' && form.isLowerBound) {
    return 'at-least'
  }
  return 'count'
}

export function toMetricDefinitionFromForm(
  form: NewSourceForm,
): MetricDefinition {
  return {
    key: form.key.trim(),
    label: form.label.trim(),
    format: toFormat(form),
    source: toSource(form),
  }
}
