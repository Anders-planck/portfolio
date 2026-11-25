import type {
  NoteCard,
  NoteInlineRun,
  NoteTopic,
} from '../../entities/note/note-query-options'
import { pickNoteTranslation } from '../../entities/note/pick-note-translation'
import type { Locale } from '../../shared/i18n/locale'

/** The filter option that shows every topic. */
export const ALL_TOPICS = 'all'

export type TopicFilter = NoteTopic | typeof ALL_TOPICS

/** A row of the Note list in the reader's language (or its fallback). */
export interface NoteListEntry {
  slug: string
  topic: NoteTopic
  publishedAt: number
  title: NoteInlineRun[]
  summary: NoteInlineRun[]
  readingMinutes: number
}

/** The rows of the list, in the order the backend gave (newest first). */
export function toNoteListEntries(
  cards: readonly NoteCard[],
  locale: Locale,
): NoteListEntry[] {
  return cards.flatMap((card) => {
    const picked = pickNoteTranslation(card.translations, locale)
    if (picked.kind === 'missing') {
      return []
    }
    const { title, summary, readingMinutes } = picked.content
    return [
      {
        slug: card.slug,
        topic: card.topic,
        publishedAt: card.publishedAt,
        title,
        summary,
        readingMinutes,
      },
    ]
  })
}

/** How many listed notes each topic has; topics without notes are left out. */
export function countNotesByTopic(
  entries: readonly NoteListEntry[],
): ReadonlyMap<NoteTopic, number> {
  return entries.reduce(
    (counts, { topic }) =>
      new Map(counts).set(topic, (counts.get(topic) ?? 0) + 1),
    new Map<NoteTopic, number>(),
  )
}
