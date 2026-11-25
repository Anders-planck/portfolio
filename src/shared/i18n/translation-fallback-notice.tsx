import { Banner } from '@astryxdesign/core/Banner'

import type { Locale } from './locale'
import { toMessagesFromLocale } from './to-messages-from-locale'
import { useMessages } from './use-messages'

/**
 * Tells the reader that the page below is in another language, because its
 * own has no translation yet (`pickTranslation` gave a fallback). The words
 * are in the reader's locale; the language is named in its own.
 */
export function TranslationFallbackNotice({
  shownLocale,
}: {
  shownLocale: Locale
}) {
  const { translationFallback } = useMessages()
  const shownLanguage = toMessagesFromLocale(shownLocale).language.name
  return (
    <Banner
      status="info"
      title={translationFallback.title(shownLanguage)}
      description={translationFallback.description}
    />
  )
}
