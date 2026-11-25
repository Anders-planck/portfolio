import type { Locale } from '../../shared/i18n/locale'
import {
  type PickedTranslation,
  pickTranslation,
} from '../../shared/i18n/pick-translation'

/**
 * The translation of a note a page shows in `locale`: its own, or the
 * shell's fallback (English, then Italian) marked so the page shows the
 * notice. Notes carry their translations as a list, one per locale.
 */
export function pickNoteTranslation<Translation extends { locale: Locale }>(
  translations: readonly Translation[],
  locale: Locale,
): PickedTranslation<Translation> {
  const byLocale = translations.reduce<Partial<Record<Locale, Translation>>>(
    (picked, translation) => ({ ...picked, [translation.locale]: translation }),
    {},
  )
  return pickTranslation(byLocale, locale)
}
