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
    notice:
      'Page de démonstration : les textes sont provisoires et ne décrivent aucun travail réel.',
    chapters: {
      opening: {
        eyebrow: 'Ouverture',
        title: 'Démo du moteur immersif',
        body: 'Une page d’essai pour les chapitres, l’index et le bloc. Aucun contenu réel.',
      },
      scroll: {
        eyebrow: 'Défilement',
        title: 'Le défilement tourne le bloc',
        body: 'Chaque chapitre donne une pose au bloc ; entre deux chapitres, le bloc passe de l’une à l’autre.',
      },
      pointer: {
        eyebrow: 'Pointeur',
        title: 'Le bloc suit le pointeur',
        body: 'Faites-le glisser pour le tourner : au relâchement, il s’arrête sur une face. Au clavier, flèches gauche et droite.',
      },
      anchors: {
        eyebrow: 'Ancres',
        title: 'Chaque chapitre a une adresse',
        body: 'L’index et les commandes sous le bloc mènent à un chapitre ; Retour revient là où vous étiez.',
      },
      layouts: {
        eyebrow: 'Mise en page',
        title: 'Linéaire quand il le faut',
        body: 'Sur un écran étroit, au toucher ou avec le mouvement réduit, la page défile en colonne et le bloc reste immobile.',
      },
    },
    faceLabels: [
      'Première face',
      'Deuxième face',
      'Troisième face',
      'Quatrième face',
    ],
    faceDetail: 'démo',
  },
  notFound: {
    documentTitle: (siteName) => `Page introuvable · ${siteName}`,
    eyebrow: 'Page introuvable',
    title: 'Cette page n’existe pas, ou plus.',
    body: 'Le bloc s’est défait. Revenons là où tout est à sa place.',
    homeLink: 'Retour à l’accueil',
    workLink: 'Voir les projets',
  },
}
