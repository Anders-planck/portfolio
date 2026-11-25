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
  immersive: {
    chapterIndexLabel: 'Chapters',
    chapterNavigationLabel: 'Chapter',
    previousChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    stageHint: 'Drag the block to turn it · scroll to change chapter',
    blockLabel: 'Block',
    blockKeyboardHint: 'Left and right arrows turn the block.',
    blockCursorLabel: 'Drag',
    chapterEyebrow: (chapterNumber, eyebrow) => `${chapterNumber} / ${eyebrow}`,
    chapterIndexStep: (chapterNumber, eyebrow) => `${chapterNumber} ${eyebrow}`,
    chapterPosition: (chapterNumber, lastChapterNumber, eyebrow) =>
      `${chapterNumber} / ${lastChapterNumber} · ${eyebrow}`,
    frontFace: (faceNumber, faceLabel) => `${faceNumber} · ${faceLabel}`,
  },
  immersiveDemo: {
    title: 'Immersive engine demo',
    description:
      'A test page for the engine of the immersive pages, with placeholder copy.',
  },
  notFound: {
    documentTitle: (siteName) => `Page not found · ${siteName}`,
    eyebrow: 'Page not found',
    title: 'This page does not exist, or not anymore.',
    body: 'The block came apart. Let’s go back to where things are in place.',
    homeLink: 'Back to home',
    workLink: 'See the work',
  },
}
