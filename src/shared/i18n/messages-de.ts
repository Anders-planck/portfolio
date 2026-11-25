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
  home: {
    emptyTitle: 'Das Profil ist noch nicht veröffentlicht.',
  },
  pageError: {
    title: 'Etwas hat nicht funktioniert.',
    body: 'Die Seite wurde nicht geladen. Versuch es gleich noch einmal.',
    retry: 'Erneut versuchen',
  },
  notFound: {
    documentTitle: (siteName) => `Seite nicht gefunden · ${siteName}`,
    eyebrow: 'Seite nicht gefunden',
    title: 'Diese Seite gibt es nicht, oder nicht mehr.',
    body: 'Der Block ist zerfallen. Zurück dorthin, wo alles an seinem Platz ist.',
    homeLink: 'Zur Startseite',
    workLink: 'Zu den Projekten',
  },
  notes: {
    title: 'Notizen',
    intro:
      'Wie ich mit Agenten Software baue, ohne die Kontrolle zu verlieren, und was ich aus Projekten lerne. Geschrieben in Markdown, in vier Sprachen, wenn ich sie übersetze.',
    topicFilterLabel: 'Nach Thema filtern',
    allTopics: 'Alle',
    topics: {
      ai: 'KI',
      mobile: 'Mobile',
      architecture: 'Architektur',
    },
    topicOption: (label, count) => `${label} · ${count}`,
    readingTime: (minutes) => `${minutes} min`,
    cardMeta: (topic, readingTime) => `${topic} · ${readingTime}`,
    readCursor: 'Lesen',
    emptyTitle: 'Noch keine Notizen veröffentlicht.',
    emptyTopicTitle: 'Keine Notizen zu diesem Thema.',
    backToNotes: 'Alle Notizen',
    outlineLabel: 'In dieser Notiz',
    progressLabel: 'Lesefortschritt',
    nextNote: 'Nächste Notiz',
    alsoIn: 'Auch verfügbar auf',
    metricVerifiedAt: (date) => `geprüft am ${date}`,
    metricUnavailable: 'Wert nicht verfügbar',
  },
}
