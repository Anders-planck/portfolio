import type { Locale } from '../../shared/i18n/locale'

/** A note's date as the page locale writes it: `24 nov 2026`, `Nov 24, 2026`. */
export function formatNoteDate(epochMs: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Rome',
  }).format(epochMs)
}
