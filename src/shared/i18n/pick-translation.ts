import { DEFAULT_LOCALE, type Locale } from './locale'

/**
 * Where a page goes when its locale has no translation: English, then the
 * Italian source (user story 19), so a reader never hits a dead end.
 */
const FALLBACK_LOCALES: readonly Locale[] = ['en', DEFAULT_LOCALE]

/** The translation a page shows, and whether it is the one asked for. */
export type PickedTranslation<Content> =
  | { kind: 'requested'; locale: Locale; content: Content }
  | { kind: 'fallback'; locale: Locale; content: Content }
  | { kind: 'missing' }

/**
 * Picks the content of `requestedLocale`, else the first fallback that has
 * one. A fallback is marked so the page shows the notice.
 */
export function pickTranslation<Content>(
  translations: Partial<Record<Locale, Content>>,
  requestedLocale: Locale,
): PickedTranslation<Content> {
  const requested = translations[requestedLocale]
  if (requested !== undefined) {
    return { kind: 'requested', locale: requestedLocale, content: requested }
  }
  const [fallback] = FALLBACK_LOCALES.flatMap((locale) => {
    const content = translations[locale]
    return content === undefined
      ? []
      : [{ kind: 'fallback' as const, locale, content }]
  })
  return fallback ?? { kind: 'missing' }
}
