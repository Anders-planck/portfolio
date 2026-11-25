import { parseNoteMarkdown } from '../notes/markdown'
import { toProseTextsFromNoteBody } from '../notes/prose'
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

// A new member of `Snapshot` stops this from typechecking until its prose
// fields are listed here.
export function toProseFieldsFromSnapshot(snapshot: Snapshot): ProseField[] {
  return snapshot.collection === 'note'
    ? toProseFieldsFromNote(snapshot)
    : toProseFieldsFromProfile(snapshot)
}

function toProseFieldsFromProfile(
  snapshot: Extract<Snapshot, { collection: 'profile' }>,
): ProseField[] {
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

/** A note's slug, topic and project keys are not prose; its copy is. */
function toProseFieldsFromNote(
  snapshot: Extract<Snapshot, { collection: 'note' }>,
): ProseField[] {
  return snapshot.content.flatMap(({ locale, title, summary, body }) => [
    { field: 'title', locale, text: title },
    { field: 'summary', locale, text: summary },
    ...toProseTextsFromNoteBody(parseNoteMarkdown(body).blocks).map((text) => ({
      field: 'body',
      locale,
      text,
    })),
  ])
}
