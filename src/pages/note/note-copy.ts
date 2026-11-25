import type { Locale } from '../../shared/i18n/locale'

/** The Nota page's own copy, kept in its route chunk (ADR 0013). */
export interface NoteCopy {
  backToNotes: string
  outlineLabel: string
  progressLabel: string
  nextNote: string
  alsoIn: string
}

export const NOTE_COPY: Record<Locale, NoteCopy> = {
  it: {
    backToNotes: 'Tutte le note',
    outlineLabel: 'In questa nota',
    progressLabel: 'Avanzamento della lettura',
    nextNote: 'Prossima nota',
    alsoIn: 'Disponibile anche in',
  },
  en: {
    backToNotes: 'All notes',
    outlineLabel: 'In this note',
    progressLabel: 'Reading progress',
    nextNote: 'Next note',
    alsoIn: 'Also available in',
  },
  fr: {
    backToNotes: 'Toutes les notes',
    outlineLabel: 'Dans cette note',
    progressLabel: 'Progression de la lecture',
    nextNote: 'Note suivante',
    alsoIn: 'Aussi disponible en',
  },
  de: {
    backToNotes: 'Alle Notizen',
    outlineLabel: 'In dieser Notiz',
    progressLabel: 'Lesefortschritt',
    nextNote: 'Nächste Notiz',
    alsoIn: 'Auch verfügbar auf',
  },
}
