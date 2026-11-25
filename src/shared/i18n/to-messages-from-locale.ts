import type { Locale } from './locale'
import type { Messages } from './messages'
import { MESSAGES_DE } from './messages-de'
import { MESSAGES_EN } from './messages-en'
import { MESSAGES_FR } from './messages-fr'
import { MESSAGES_IT } from './messages-it'

const MESSAGES_BY_LOCALE: Record<Locale, Messages> = {
  it: MESSAGES_IT,
  en: MESSAGES_EN,
  fr: MESSAGES_FR,
  de: MESSAGES_DE,
}

/** The shell copy of a locale; the type makes every locale complete. */
export function toMessagesFromLocale(locale: Locale): Messages {
  return MESSAGES_BY_LOCALE[locale]
}
