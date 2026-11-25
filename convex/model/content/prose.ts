import type { Locale } from './locales'
import { pickProfileContentFields } from './profile'
import type { Snapshot } from './snapshot'

/**
 * The prose fields of a document: the copy a visitor reads, where figures
 * must be metric references (ADR 0004). Addresses (email, link targets) and
 * dedicated date or period fields are not prose, so they are never listed.
 */

export interface ProseField {
  field: string
  locale: Locale | null
  text: string
}

// Profile is the only collection; a new member of `Snapshot` stops this from
// typechecking until its prose fields are listed here.
export function toProseFieldsFromSnapshot(snapshot: Snapshot): ProseField[] {
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
