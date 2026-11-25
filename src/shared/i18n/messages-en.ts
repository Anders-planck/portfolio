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
  home: {
    emptyTitle: 'The profile is not published yet.',
  },
  pageError: {
    title: 'Something went wrong.',
    body: 'The page did not load. Try again in a moment.',
    retry: 'Try again',
  },
  notFound: {
    documentTitle: (siteName) => `Page not found · ${siteName}`,
    eyebrow: 'Page not found',
    title: 'This page does not exist, or not anymore.',
    body: 'The block came apart. Let’s go back to where things are in place.',
    homeLink: 'Back to home',
    workLink: 'See the work',
  },
  notes: {
    title: 'Notes',
    intro:
      'How I build software with agents without losing control, and what I learn from projects. Written in Markdown, in four languages when I translate them.',
    topicFilterLabel: 'Filter by topic',
    allTopics: 'All',
    topics: {
      ai: 'AI',
      mobile: 'Mobile',
      architecture: 'Architecture',
    },
    topicOption: (label, count) => `${label} · ${count}`,
    readingTime: (minutes) => `${minutes} min`,
    cardMeta: (topic, readingTime) => `${topic} · ${readingTime}`,
    readCursor: 'Read',
    emptyTitle: 'No notes published yet.',
    emptyTopicTitle: 'No notes on this topic.',
    backToNotes: 'All notes',
    outlineLabel: 'In this note',
    progressLabel: 'Reading progress',
    nextNote: 'Next note',
    alsoIn: 'Also available in',
    metricVerifiedAt: (date) => `checked on ${date}`,
    metricUnavailable: 'figure unavailable',
  },
}
