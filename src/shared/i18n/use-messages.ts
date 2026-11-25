import type { Messages } from './messages'
import { toMessagesFromLocale } from './to-messages-from-locale'
import { useLocale } from './use-locale'

/** The shell copy in the locale of the page on screen. */
export function useMessages(): Messages {
  return toMessagesFromLocale(useLocale())
}
