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
  immersive: {
    chapterIndexLabel: 'Kapitel',
    chapterNavigationLabel: 'Kapitelnavigation',
    previousChapter: 'Vorheriges Kapitel',
    nextChapter: 'Nächstes Kapitel',
    stageHint:
      'Block ziehen, um ihn zu drehen · scrollen, um das Kapitel zu wechseln',
    blockLabel: 'Block',
    blockKeyboardHint: 'Die Pfeiltasten links und rechts drehen den Block.',
    blockCursorLabel: 'Ziehen',
    chapterEyebrow: (chapterNumber, eyebrow) => `${chapterNumber} / ${eyebrow}`,
    chapterIndexStep: (chapterNumber, eyebrow) => `${chapterNumber} ${eyebrow}`,
    chapterPosition: (chapterNumber, lastChapterNumber, eyebrow) =>
      `${chapterNumber} / ${lastChapterNumber} · ${eyebrow}`,
    frontFace: (faceNumber, faceLabel) => `${faceNumber} · ${faceLabel}`,
  },
  immersiveDemo: {
    title: 'Demo der immersiven Engine',
    description:
      'Eine Testseite der Engine für die immersiven Seiten, mit Platzhaltertexten.',
    notice:
      'Demoseite: Die Texte sind Platzhalter und beschreiben keine echte Arbeit.',
    chapters: {
      opening: {
        eyebrow: 'Auftakt',
        title: 'Demo der immersiven Engine',
        body: 'Eine Testseite für Kapitel, Index und Block. Kein echter Inhalt.',
      },
      scroll: {
        eyebrow: 'Scrollen',
        title: 'Scrollen dreht den Block',
        body: 'Jedes Kapitel gibt dem Block eine Pose; zwischen zwei Kapiteln geht der Block von der einen zur anderen.',
      },
      pointer: {
        eyebrow: 'Zeiger',
        title: 'Der Block folgt dem Zeiger',
        body: 'Ziehen dreht ihn: Beim Loslassen hält er auf einer Seite. Mit der Tastatur: Pfeile links und rechts.',
      },
      anchors: {
        eyebrow: 'Anker',
        title: 'Jedes Kapitel hat eine Adresse',
        body: 'Index und Steuerung unter dem Block führen zu einem Kapitel; Zurück bringt dich dorthin, wo du warst.',
      },
      layouts: {
        eyebrow: 'Layout',
        title: 'Linear, wenn es hilft',
        body: 'Auf schmalen Bildschirmen, bei Touch oder reduzierter Bewegung läuft die Seite als Spalte und der Block bleibt still.',
      },
    },
    faceLabels: ['Erste Seite', 'Zweite Seite', 'Dritte Seite', 'Vierte Seite'],
    faceDetail: 'Demo',
  },
  notFound: {
    documentTitle: (siteName) => `Seite nicht gefunden · ${siteName}`,
    eyebrow: 'Seite nicht gefunden',
    title: 'Diese Seite gibt es nicht, oder nicht mehr.',
    body: 'Der Block ist zerfallen. Zurück dorthin, wo alles an seinem Platz ist.',
    homeLink: 'Zur Startseite',
    workLink: 'Zu den Projekten',
  },
}
