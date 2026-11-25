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
    frontFace: (faceNumber, faceLabel) => `${faceNumber} · ${faceLabel}`,
  },
  immersiveDemo: {
    title: 'Immersive engine demo',
    description:
      'A test page for the engine of the immersive pages, with placeholder copy.',
    notice:
      'Demo page: the copy is placeholder text and describes no real work.',
    chapters: {
      opening: {
        eyebrow: 'Opening',
        title: 'Immersive engine demo',
        body: 'A test page for chapters, index and block. No real content.',
      },
      scroll: {
        eyebrow: 'Scroll',
        title: 'Scrolling turns the block',
        body: 'Each chapter gives the block a pose; between two chapters the block moves from one to the other.',
      },
      pointer: {
        eyebrow: 'Pointer',
        title: 'The block follows the pointer',
        body: 'Drag it to turn it: on release it stops on a face. From the keyboard, left and right arrows.',
      },
      anchors: {
        eyebrow: 'Anchors',
        title: 'Every chapter has an address',
        body: 'The index and the controls under the block lead to a chapter; Back returns to where you were.',
      },
      layouts: {
        eyebrow: 'Layout',
        title: 'Linear when it helps',
        body: 'On a narrow screen, on touch or with reduced motion the page runs as a column and the block stays still.',
      },
    },
    faceLabels: ['First face', 'Second face', 'Third face', 'Fourth face'],
    faceDetail: 'demo',
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
