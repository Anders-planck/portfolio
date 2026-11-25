import type { Locale } from '../../shared/i18n/locale'

/** A count (reading minutes, notes in a filter) as the page locale writes it. */
export function formatNoteCount(count: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { useGrouping: 'always' }).format(count)
}
