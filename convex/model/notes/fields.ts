import { type Infer, v } from 'convex/values'

/**
 * Note collection: an article in Markdown with directives (GLOSSARY), one
 * document per note with shared fields plus one content record per locale.
 * Its status (draft, scheduled, published) is never stored: the content
 * store's pointers and releases say it (ADR 0003).
 */

/** The topics of the Note filter (mockup `Note`): AI, Mobile, Architettura. */
export const noteTopicValidator = v.union(
  v.literal('ai'),
  v.literal('mobile'),
  v.literal('architecture'),
)
export type NoteTopic = Infer<typeof noteTopicValidator>

export const NOTE_TOPICS: readonly NoteTopic[] = noteTopicValidator.members.map(
  (member) => member.value,
)

export const noteFieldsValidator = v.object({
  /** The address of the note, `/note/<slug>`, the same in every locale. */
  slug: v.string(),
  topic: noteTopicValidator,
  /** Keys of the projects whose pages also show the note (ticket 09). */
  linkedProjectKeys: v.array(v.string()),
})

export const noteContentFieldsValidator = v.object({
  title: v.string(),
  /** One sentence under the title in the Note list; also the SEO description. */
  summary: v.string(),
  /** Markdown with the `case`, `metric` and `figure` directives. */
  body: v.string(),
})

export type NoteFields = Infer<typeof noteFieldsValidator>
export type NoteContentFields = Infer<typeof noteContentFieldsValidator>

/** The per-locale fields of a record that carries more (row, snapshot entry). */
export function pickNoteContentFields(
  record: NoteContentFields,
): NoteContentFields {
  return { title: record.title, summary: record.summary, body: record.body }
}

/** Values a note or locale record starts from before its first edit. */
export const EMPTY_NOTE_FIELDS: NoteFields = {
  slug: '',
  topic: 'ai',
  linkedProjectKeys: [],
}

export const EMPTY_NOTE_CONTENT_FIELDS: NoteContentFields = {
  title: '',
  summary: '',
  body: '',
}
