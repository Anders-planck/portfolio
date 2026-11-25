import {
  findMalformedReferences,
  listReferencedMetricKeys,
} from '../metrics/references'
import { toProseFieldsFromSnapshot } from './prose'
import type { RuleContext } from './rulecontext'
import type { Snapshot } from './snapshot'

/**
 * The metric-reference publish rule (ADR 0004): every `{{m:key}}` in prose
 * names a metric that exists, and nothing that tries to be a reference is
 * malformed (`{{ m:key }}`, `{{M:key}}`), which would render as raw text.
 * Same finding shape as `rules.ts`, without importing it (see `numeralrule.ts`).
 */
export function referenceRule(snapshot: Snapshot, context: RuleContext) {
  return toProseFieldsFromSnapshot(snapshot).flatMap(
    ({ field, locale, text }) => [
      ...findMalformedReferences(text).map((written) => ({
        rule: 'malformed-metric-reference',
        severity: 'block' as const,
        field,
        locale,
        message: `Malformed metric reference "${written}": write {{m:key}}`,
      })),
      ...listReferencedMetricKeys(text)
        .filter((key) => !context.metricKeys.has(key))
        .map((key) => ({
          rule: 'unknown-metric',
          severity: 'block' as const,
          field,
          locale,
          message: `No metric "${key}"`,
        })),
    ],
  )
}
