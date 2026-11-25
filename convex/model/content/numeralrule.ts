import { findFreeNumerals } from '../metrics/numerals'
import type { Locale } from './locales'
import { pickProfileContentFields } from './profile'
import type { Snapshot } from './snapshot'

/**
 * The free-numeral publish rule (ADR 0004) over a document's prose fields:
 * the copy a visitor reads. Addresses (email, link targets) and dedicated
 * date or period fields are not prose, so they are never listed here.
 *
 * It returns the finding shape of `rules.ts` without importing it, because
 * `rules.ts` imports this rule into `PUBLISH_RULES`.
 */

interface ProseField {
  field: string
  locale: Locale | null
  text: string
}

// Profile is the only collection; a new member of `Snapshot` stops this from
// typechecking until its prose fields are listed here.
function toProseFieldsFromSnapshot(snapshot: Snapshot): ProseField[] {
  const { name, skills, links } = snapshot.fields
  const shared: ProseField[] = [
    { field: 'name', locale: null, text: name },
    ...Object.entries(skills).map(([area, text]) => ({
      field: `skills.${area}`,
      locale: null,
      text,
    })),
    ...links.map((link, position) => ({
      field: `links.${String(position)}.label`,
      locale: null,
      text: link.label,
    })),
  ]
  const localized = snapshot.content.flatMap(({ locale, ...record }) =>
    Object.entries(pickProfileContentFields(record)).map(([field, text]) => ({
      field,
      locale,
      text,
    })),
  )
  return [...shared, ...localized]
}

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
