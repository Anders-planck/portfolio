import { type Infer, v } from 'convex/values'

import { isMetricKey } from './references'
import type { Source } from './sources'
import type { MetricDefinition } from './tables'

/**
 * Checks of what the owner enters in Fonti (pure). Problems are typed results
 * the CMS shows above the form's fields (DATA-03); they never throw.
 */

// npm's own package-name grammar (lowercase, optional scope).
const NPM_PACKAGE_PATTERN =
  /^(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/
// GitHub's login grammar: alphanumerics and single inner hyphens, at most 39.
const GITHUB_LOGIN_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/
const GITHUB_REPO_PATTERN = /^[A-Za-z0-9-]+\/[A-Za-z0-9_-][A-Za-z0-9._-]*$/

export const definitionProblemValidator = v.union(
  v.object({ kind: v.literal('invalid-key') }),
  v.object({ kind: v.literal('key-taken') }),
  v.object({ kind: v.literal('empty-label') }),
  v.object({ kind: v.literal('invalid-package') }),
  v.object({ kind: v.literal('no-repos') }),
  v.object({ kind: v.literal('invalid-repo'), repo: v.string() }),
  v.object({ kind: v.literal('invalid-login') }),
  v.object({ kind: v.literal('empty-query') }),
  v.object({ kind: v.literal('format-needs-total') }),
)
export type DefinitionProblem = Infer<typeof definitionProblemValidator>

export const manualCountProblemValidator = v.union(
  v.object({ kind: v.literal('unknown-metric') }),
  v.object({ kind: v.literal('not-manual') }),
  v.object({ kind: v.literal('invalid-value') }),
  v.object({ kind: v.literal('counted-in-future') }),
  v.object({ kind: v.literal('missing-evidence') }),
)
export type ManualCountProblem = Infer<typeof manualCountProblemValidator>

export interface ManualCount {
  value: number
  countedAt: number
  evidence: string
}

function findSourceProblems(source: Source): DefinitionProblem[] {
  switch (source.kind) {
    case 'npm': {
      return NPM_PACKAGE_PATTERN.test(source.packageName)
        ? []
        : [{ kind: 'invalid-package' }]
    }
    case 'github-commits': {
      const repoProblems = source.repos
        .filter(
          (repo) => !GITHUB_REPO_PATTERN.test(repo) || repo.includes('..'),
        )
        .map((repo): DefinitionProblem => ({ kind: 'invalid-repo', repo }))
      return [
        ...(source.repos.length === 0 ? [{ kind: 'no-repos' } as const] : []),
        ...repoProblems,
        ...(GITHUB_LOGIN_PATTERN.test(source.login)
          ? []
          : [{ kind: 'invalid-login' } as const]),
      ]
    }
    case 'github-search': {
      return source.query.trim() === '' ? [{ kind: 'empty-query' }] : []
    }
    case 'manual': {
      return []
    }
  }
}

export function findDefinitionProblems(
  definition: MetricDefinition,
): DefinitionProblem[] {
  const hasTotal = definition.source.kind === 'github-commits'
  return [
    ...(isMetricKey(definition.key) ? [] : [{ kind: 'invalid-key' } as const]),
    ...(definition.label.trim() === ''
      ? [{ kind: 'empty-label' } as const]
      : []),
    ...findSourceProblems(definition.source),
    ...(definition.format === 'count-of-total' && !hasTotal
      ? [{ kind: 'format-needs-total' } as const]
      : []),
  ]
}

export function findManualCountProblems(
  count: ManualCount,
  now: number,
): ManualCountProblem[] {
  const isWholeCount = Number.isSafeInteger(count.value) && count.value >= 0
  return [
    ...(isWholeCount ? [] : [{ kind: 'invalid-value' } as const]),
    ...(count.countedAt > now || !Number.isFinite(count.countedAt)
      ? [{ kind: 'counted-in-future' } as const]
      : []),
    ...(count.evidence.trim() === ''
      ? [{ kind: 'missing-evidence' } as const]
      : []),
  ]
}
