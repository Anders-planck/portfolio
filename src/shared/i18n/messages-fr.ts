import type { Messages } from './messages'

export const MESSAGES_FR: Messages = {
  site: {
    name: 'Anders Planck',
    wordmark: 'anders/planck',
    description: 'Frontend et full-stack en TypeScript.',
  },
  navigation: {
    label: 'Navigation principale',
    footerLabel: 'Navigation du site',
    work: 'Projets',
    notes: 'Notes',
    careerPath: 'Parcours',
    cv: 'CV · PDF',
  },
  language: {
    name: 'Français',
    code: 'FR',
    menuLabel: 'Langue',
    menuButtonLabel: (code) => `Langue: ${code}`,
    menuHint: 'Changer de langue vous laisse sur la même page.',
  },
  translationFallback: {
    title: (shownLanguage) =>
      `Cette page n’est pas encore traduite : vous la lisez en ${shownLanguage}.`,
    description: 'Les menus et la navigation restent dans la langue choisie.',
  },
  home: {
    emptyTitle: 'Le profil n’est pas encore publié.',
  },
  pageError: {
    title: 'Quelque chose n’a pas fonctionné.',
    body: 'La page ne s’est pas chargée. Réessayez dans un instant.',
    retry: 'Réessayer',
  },
  immersive: {
    chapterIndexLabel: 'Chapitres',
    chapterNavigationLabel: 'Chapitre',
    previousChapter: 'Chapitre précédent',
    nextChapter: 'Chapitre suivant',
    stageHint:
      'Faites glisser le bloc pour le tourner · défilez pour changer de chapitre',
    blockLabel: 'Bloc',
    blockKeyboardHint: 'Les flèches gauche et droite tournent le bloc.',
    blockCursorLabel: 'Glisser',
    chapterEyebrow: (chapterNumber, eyebrow) => `${chapterNumber} / ${eyebrow}`,
    chapterIndexStep: (chapterNumber, eyebrow) => `${chapterNumber} ${eyebrow}`,
    chapterPosition: (chapterNumber, lastChapterNumber, eyebrow) =>
      `${chapterNumber} / ${lastChapterNumber} · ${eyebrow}`,
    frontFace: (faceNumber, faceLabel) => `${faceNumber} · ${faceLabel}`,
  },
  immersiveDemo: {
    title: 'Démo du moteur immersif',
    description:
      'Une page d’essai du moteur des pages immersives, avec des textes provisoires.',
  },
  notFound: {
    documentTitle: (siteName) => `Page introuvable · ${siteName}`,
    eyebrow: 'Page introuvable',
    title: 'Cette page n’existe pas, ou plus.',
    body: 'Le bloc s’est défait. Revenons là où tout est à sa place.',
    homeLink: 'Retour à l’accueil',
    workLink: 'Voir les projets',
  },
  notes: {
    title: 'Notes',
    intro:
      'Comment je construis du logiciel avec des agents sans en perdre le contrôle, et ce que j’apprends des projets. Écrites en Markdown, en quatre langues quand je les traduis.',
    topicFilterLabel: 'Filtrer par thème',
    allTopics: 'Toutes',
    topics: {
      ai: 'IA',
      mobile: 'Mobile',
      architecture: 'Architecture',
    },
    topicOption: (label, count) => `${label} · ${count}`,
    readingTime: (minutes) => `${minutes} min`,
    cardMeta: (topic, readingTime) => `${topic} · ${readingTime}`,
    readCursor: 'Lire',
    emptyTitle: 'Aucune note publiée pour l’instant.',
    emptyTopicTitle: 'Aucune note sur ce thème.',
    backToNotes: 'Toutes les notes',
    outlineLabel: 'Dans cette note',
    progressLabel: 'Progression de la lecture',
    nextNote: 'Note suivante',
    alsoIn: 'Aussi disponible en',
    metricVerifiedAt: (date) => `vérifié le ${date}`,
    metricUnavailable: 'donnée indisponible',
  },
}
