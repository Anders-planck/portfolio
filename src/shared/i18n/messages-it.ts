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
  notFound: {
    documentTitle: (siteName) => `Pagina non trovata · ${siteName}`,
    eyebrow: 'Errore 404',
    title: 'Questa pagina non esiste, o non più.',
    body: 'Il blocco si è smontato. Torniamo dove le cose sono al loro posto.',
    homeLink: 'Torna alla home',
    workLink: 'Vai ai lavori',
  },
}
