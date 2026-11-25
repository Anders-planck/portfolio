import type { Messages } from './messages'

export const MESSAGES_EN: Messages = {
  site: {
    name: 'Anders Planck',
    wordmark: 'anders/planck',
    description: 'Frontend and full-stack in TypeScript.',
  },
  navigation: {
    label: 'Main navigation',
    footerLabel: 'Site navigation',
    work: 'Work',
    notes: 'Notes',
    careerPath: 'Path',
    cv: 'CV · PDF',
  },
  language: {
    name: 'English',
    code: 'EN',
    menuLabel: 'Language',
    menuButtonLabel: (code) => `Language: ${code}`,
    menuHint: 'Switching language keeps you on the same page.',
  },
  translationFallback: {
    title: (shownLanguage) =>
      `This page is not translated yet: you are reading it in ${shownLanguage}.`,
    description: 'Menus and navigation stay in the language you chose.',
  },
  notFound: {
    pageTitle: 'Page not found',
    eyebrow: 'Error 404',
    title: 'This page does not exist, or not anymore.',
    body: 'The block came apart. Let’s go back to where things are in place.',
    homeLink: 'Back to home',
    workLink: 'See the work',
  },
}
