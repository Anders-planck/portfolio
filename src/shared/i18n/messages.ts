/**
 * The copy of the site shell in one locale (DATA-05). Page content comes from
 * Convex; this holds only the words the shell itself shows. Every locale
 * file satisfies this type, so none can miss a key.
 */
export interface Messages {
  site: {
    /** The owner's name, as the title of the home page and of the site. */
    name: string
    /** The wordmark in the header and the footer. */
    wordmark: string
    description: string
  }
  navigation: {
    label: string
    footerLabel: string
    work: string
    notes: string
    careerPath: string
    cv: string
  }
  language: {
    /** This locale's own name, as the language menu lists it. */
    name: string
    /** The short code on the menu button. */
    code: string
    menuLabel: string
    /** The menu button's accessible name; it contains the visible code. */
    menuButtonLabel: (code: string) => string
    menuHint: string
  }
  translationFallback: {
    title: (shownLanguage: string) => string
    description: string
  }
  home: {
    /** Shown while no Profile is published in any locale. */
    emptyTitle: string
  }
  pageError: {
    title: string
    body: string
    retry: string
  }
  immersive: {
    /** The accessible name of the chapter index (Stepper). */
    chapterIndexLabel: string
    /** The accessible name of the ‹ › chapter navigation group. */
    chapterNavigationLabel: string
    previousChapter: string
    nextChapter: string
    /** Under the chapter navigation: what the Block and the scroll do. */
    stageHint: string
    /** The accessible name of the Block. */
    blockLabel: string
    /** How to turn the Block from the keyboard. */
    blockKeyboardHint: string
    /** The cursor label over the Block. */
    blockCursorLabel: string
    /** A chapter's eyebrow, e.g. "01 / Discipline". */
    chapterEyebrow: (chapterNumber: string, eyebrow: string) => string
    /** A step of the chapter index, e.g. "01 Discipline". */
    chapterIndexStep: (chapterNumber: string, eyebrow: string) => string
    /** The active chapter in the ‹ › navigation, e.g. "01 / 05 · Discipline". */
    chapterPosition: (
      chapterNumber: string,
      lastChapterNumber: string,
      eyebrow: string,
    ) => string
    /** The face that looks at the reader, e.g. "02 · Backend". */
    frontFace: (faceNumber: string, faceLabel: string) => string
  }
  /** The head of the engine demo page; its body copy is in its route chunk (ADR 0013). */
  immersiveDemo: {
    title: string
    description: string
  }
  notFound: {
    /** The browser tab title of the 404 page. */
    documentTitle: (siteName: string) => string
    eyebrow: string
    title: string
    body: string
    homeLink: string
    workLink: string
  }
}
