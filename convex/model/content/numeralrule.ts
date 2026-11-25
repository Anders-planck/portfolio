import { findFreeNumerals } from '../metrics/numerals'
import { toProseFieldsFromSnapshot } from './prose'
import type { Snapshot } from './snapshot'

/**
 * The free-numeral publish rule (ADR 0004) over a document's prose fields.
 * It returns the finding shape of `rules.ts` without importing it, because
 * `rules.ts` imports this rule into `PUBLISH_RULES`.
 */

/**
 * `message` is the server's diagnostic (seed errors, logs). The CMS words a
 * finding for the owner from `rule` with its own Italian messages (DATA-05),
 * as for every rule; it shows the field's text, so it can mark the numeral.
 */
export function numeralRule(snapshot: Snapshot) {
  return toProseFieldsFromSnapshot(snapshot).flatMap(
    ({ field, locale, text }) =>
      findFreeNumerals(text).map((numeral) => ({
        rule: 'free-numeral',
        severity: 'block' as const,
        field,
        locale,
        message: `Free number "${numeral}": use a metric reference {{m:key}}`,
      })),
  )
}
