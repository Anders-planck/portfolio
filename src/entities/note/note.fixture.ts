import type { NoteCard, NoteInlineRun, NotePage } from './note-query-options'

/** Plain runs of `text`, as the backend renders unmarked prose. */
export function toPlainRuns(text: string): NoteInlineRun[] {
  return [{ kind: 'text', text, marks: [] }]
}

/** 24 Nov 2026, noon in Italy. */
export const PUBLISHED_AT = Date.UTC(2026, 10, 24, 11)

/** A note published in Italian, shaped as `notes.getPublished` returns it. */
export const NOTE_PAGE: NotePage = {
  slug: 'review-agenti',
  topic: 'ai',
  publishedAt: PUBLISHED_AT,
  translations: [
    {
      locale: 'it',
      title: toPlainRuns('Cosa cerco nel codice di un agente'),
      summary: toPlainRuns('Errori tipici e come li intercetto.'),
      readingMinutes: 7,
      blocks: [
        {
          kind: 'heading',
          level: 2,
          id: 'errori-di-architettura',
          inlines: toPlainRuns('Errori di architettura'),
        },
        { kind: 'paragraph', inlines: toPlainRuns('Una modifica piccola.') },
      ],
      outline: [
        {
          id: 'errori-di-architettura',
          label: 'Errori di architettura',
          level: 2,
        },
      ],
    },
  ],
  next: {
    slug: 'regole-nel-lint',
    translations: [{ locale: 'it', title: toPlainRuns('Regole nel lint') }],
  },
}

/** The same note as the Note list shows it. */
export const NOTE_CARD: NoteCard = {
  slug: NOTE_PAGE.slug,
  topic: NOTE_PAGE.topic,
  publishedAt: PUBLISHED_AT,
  translations: NOTE_PAGE.translations.map(
    ({ locale, title, summary, readingMinutes }) => ({
      locale,
      title,
      summary,
      readingMinutes,
    }),
  ),
}
