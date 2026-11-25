import type { Messages } from './messages'

export const MESSAGES_DE: Messages = {
  site: {
    name: 'Anders Planck',
    wordmark: 'anders/planck',
    description: 'Frontend und Full-Stack in TypeScript.',
  },
  navigation: {
    label: 'Hauptnavigation',
    footerLabel: 'Seitennavigation',
    work: 'Projekte',
    notes: 'Notizen',
    careerPath: 'Werdegang',
    cv: 'CV · PDF',
  },
  language: {
    name: 'Deutsch',
    code: 'DE',
    menuLabel: 'Sprache',
    menuButtonLabel: (code) => `Sprache: ${code}`,
    menuHint: 'Beim Sprachwechsel bleibst du auf derselben Seite.',
  },
  translationFallback: {
    title: (shownLanguage) =>
      `Diese Seite ist noch nicht übersetzt: du liest sie auf ${shownLanguage}.`,
    description: 'Menüs und Navigation bleiben in der gewählten Sprache.',
  },
  notFound: {
    documentTitle: (siteName) => `Seite nicht gefunden · ${siteName}`,
    eyebrow: 'Fehler 404',
    title: 'Diese Seite gibt es nicht, oder nicht mehr.',
    body: 'Der Block ist zerfallen. Zurück dorthin, wo alles an seinem Platz ist.',
    homeLink: 'Zur Startseite',
    workLink: 'Zu den Projekten',
  },
}
