import { PUBLISHED_AT, toPlainRuns } from './note.fixture'
import type { EditableNote, NoteRow } from './note-draft'

/** A note draft as `notes.getEditableNote` returns it in Italian. */
export const EDITABLE_NOTE: EditableNote = {
  revision: 4,
  savedAt: new Date(2026, 10, 25, 10, 42).getTime(),
  fields: { slug: 'review-agenti', topic: 'ai', linkedProjectKeys: [] },
  content: {
    title: 'Cosa cerco nel codice di un agente',
    summary: 'Errori tipici.',
    body: '## Il metodo\n\nChi scrive non rivede.',
  },
  translatedLocales: ['it'],
  publication: { kind: 'draft' },
  preview: {
    blocks: [
      {
        kind: 'heading',
        level: 2,
        id: 'il-metodo',
        inlines: toPlainRuns('Il metodo'),
      },
      { kind: 'paragraph', inlines: toPlainRuns('Chi scrive non rivede.') },
    ],
    outline: [{ id: 'il-metodo', label: 'Il metodo', level: 2 }],
    wordCount: 6,
    readingMinutes: 1,
  },
  findings: [],
}

/** CMS rows: one note per publication state. */
export const NOTE_ROWS: NoteRow[] = [
  {
    key: 'note-published',
    title: 'Pubblicata da tempo',
    topic: 'ai',
    locales: ['it', 'en'],
    publication: {
      kind: 'published',
      publishedAt: PUBLISHED_AT,
      scheduledEditAt: null,
    },
    readingMinutes: 7,
    updatedAt: PUBLISHED_AT,
  },
  {
    key: 'note-draft',
    title: '',
    topic: 'mobile',
    locales: [],
    publication: { kind: 'draft' },
    readingMinutes: null,
    updatedAt: PUBLISHED_AT,
  },
]
