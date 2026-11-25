import type { Locale } from '../../shared/i18n/locale'

/** The Note list's own copy, kept in its route chunk (ADR 0013). */
export interface NoteListCopy {
  topicFilterLabel: string
  allTopics: string
  topicOption: (label: string, count: string) => string
  emptyTitle: string
  emptyTopicTitle: string
}

export const NOTE_LIST_COPY: Record<Locale, NoteListCopy> = {
  it: {
    topicFilterLabel: 'Filtra per tema',
    allTopics: 'Tutte',
    topicOption: (label: string, count: string) => `${label} · ${count}`,
    emptyTitle: 'Ancora nessuna nota pubblicata.',
    emptyTopicTitle: 'Nessuna nota su questo tema.',
  },
  en: {
    topicFilterLabel: 'Filter by topic',
    allTopics: 'All',
    topicOption: (label: string, count: string) => `${label} · ${count}`,
    emptyTitle: 'No notes published yet.',
    emptyTopicTitle: 'No notes on this topic.',
  },
  fr: {
    topicFilterLabel: 'Filtrer par thème',
    allTopics: 'Toutes',
    topicOption: (label: string, count: string) => `${label} · ${count}`,
    emptyTitle: 'Aucune note publiée pour l’instant.',
    emptyTopicTitle: 'Aucune note sur ce thème.',
  },
  de: {
    topicFilterLabel: 'Nach Thema filtern',
    allTopics: 'Alle',
    topicOption: (label: string, count: string) => `${label} · ${count}`,
    emptyTitle: 'Noch keine Notizen veröffentlicht.',
    emptyTopicTitle: 'Keine Notizen zu diesem Thema.',
  },
}
