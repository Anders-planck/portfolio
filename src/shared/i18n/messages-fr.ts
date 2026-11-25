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
  notFound: {
    documentTitle: (siteName) => `Page introuvable · ${siteName}`,
    eyebrow: 'Erreur 404',
    title: 'Cette page n’existe pas, ou plus.',
    body: 'Le bloc s’est défait. Revenons là où tout est à sa place.',
    homeLink: 'Retour à l’accueil',
    workLink: 'Voir les projets',
  },
}
