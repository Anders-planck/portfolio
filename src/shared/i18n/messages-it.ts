import type { Messages } from './messages'

export const MESSAGES_IT: Messages = {
  site: {
    name: 'Anders Planck',
    wordmark: 'anders/planck',
    description: 'Frontend e full-stack in TypeScript.',
  },
  navigation: {
    label: 'Navigazione principale',
    footerLabel: 'Navigazione del sito',
    work: 'Lavori',
    notes: 'Note',
    careerPath: 'Percorso',
    cv: 'CV · PDF',
  },
  language: {
    name: 'Italiano',
    code: 'IT',
    menuLabel: 'Lingua',
    menuButtonLabel: (code) => `Lingua: ${code}`,
    menuHint: 'Cambiando lingua resti sulla stessa pagina.',
  },
  translationFallback: {
    title: (shownLanguage) =>
      `Questa pagina non è ancora tradotta: la leggi in ${shownLanguage}.`,
    description: 'Menu e navigazione restano nella lingua che hai scelto.',
  },
  home: {
    emptyTitle: 'Il profilo non è ancora pubblicato.',
  },
  pageError: {
    title: 'Qualcosa non ha funzionato.',
    body: 'La pagina non si è caricata. Riprova tra poco.',
    retry: 'Riprova',
  },
  notFound: {
    documentTitle: (siteName) => `Pagina non trovata · ${siteName}`,
    eyebrow: 'Pagina non trovata',
    title: 'Questa pagina non esiste, o non più.',
    body: 'Il blocco si è smontato. Torniamo dove le cose sono al loro posto.',
    homeLink: 'Torna alla home',
    workLink: 'Vai ai lavori',
  },
  notes: {
    title: 'Note',
    intro:
      'Come costruisco software con gli agenti senza perdere il controllo, e cosa imparo dai progetti. Scritte in Markdown, in quattro lingue quando le traduco.',
    topicFilterLabel: 'Filtra per tema',
    allTopics: 'Tutte',
    topics: {
      ai: 'AI',
      mobile: 'Mobile',
      architecture: 'Architettura',
    },
    topicOption: (label, count) => `${label} · ${count}`,
    readingTime: (minutes) => `${minutes} min`,
    cardMeta: (topic, readingTime) => `${topic} · ${readingTime}`,
    readCursor: 'Leggi',
    emptyTitle: 'Ancora nessuna nota pubblicata.',
    emptyTopicTitle: 'Nessuna nota su questo tema.',
    backToNotes: 'Tutte le note',
    outlineLabel: 'In questa nota',
    progressLabel: 'Avanzamento della lettura',
    nextNote: 'Prossima nota',
    alsoIn: 'Disponibile anche in',
    metricVerifiedAt: (date) => `verificato il ${date}`,
    metricUnavailable: 'dato non disponibile',
  },
}
