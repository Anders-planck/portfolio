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
  notFound: {
    /** The browser tab title of the 404 page. */
    documentTitle: (siteName: string) => string
    eyebrow: string
    title: string
    body: string
    homeLink: string
    workLink: string
  }
  notes: {
    /** The Note list's heading and browser tab title. */
    title: string
    intro: string
    topicFilterLabel: string
    allTopics: string
    topics: { ai: string; mobile: string; architecture: string }
    /** A filter option with how many published notes it shows. */
    topicOption: (label: string, count: string) => string
    readingTime: (minutes: string) => string
    /** Under a note in the list: its topic and reading time. */
    cardMeta: (topic: string, readingTime: string) => string
    /** The custom cursor's label over a note link. */
    readCursor: string
    emptyTitle: string
    emptyTopicTitle: string
    backToNotes: string
    outlineLabel: string
    progressLabel: string
    nextNote: string
    alsoIn: string
    metricVerifiedAt: (date: string) => string
    metricUnavailable: string
  }
}
