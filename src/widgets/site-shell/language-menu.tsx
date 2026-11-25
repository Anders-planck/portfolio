import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu'
import { Text } from '@astryxdesign/core/Text'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'

import { astryxCatalogQueryOptions } from '../../shared/i18n/astryx-catalog-query-options'
import {
  isLocale,
  type Locale,
  LOCALES,
  toHrefInLocale,
} from '../../shared/i18n/locale'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'

/**
 * Marks a language name with its own language, so a screen reader says
 * "Deutsch" in German. Astryx `Text` takes no `lang`, so it goes on through
 * the ref; the rows render only in the open menu, in the browser.
 */
function markLanguage(element: HTMLElement | null, locale: Locale): void {
  element?.setAttribute('lang', locale)
}

/**
 * The language menu: the same page in another locale, query and anchor
 * kept. Astryx gives the keyboard, Esc and focus return. Opening it fetches
 * the other locales' Astryx words, so the switch does not wait for them.
 */
export function LanguageMenu() {
  const locale = useLocale()
  const { language } = useMessages()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const prefetchOtherLocales = (isOpen: boolean) => {
    if (!isOpen) {
      return
    }
    LOCALES.filter((other) => other !== locale).forEach((other) => {
      // A failed prefetch only means the root loader fetches it again.
      queryClient.query(astryxCatalogQueryOptions(other)).catch(() => undefined)
    })
  }

  const openLocale = (value: string) => {
    if (!isLocale(value) || value === locale) {
      return
    }
    void navigate({ href: toHrefInLocale(location, value) })
  }

  return (
    <DropdownMenu
      button={{
        label: language.menuButtonLabel(language.code),
        children: language.code,
        variant: 'ghost',
      }}
      header={
        <Text type="supporting" as="p">
          {language.menuHint}
        </Text>
      }
      alignment="end"
      onOpenChange={prefetchOtherLocales}
    >
      <DropdownMenuRadioGroup
        label={language.menuLabel}
        value={locale}
        onChange={openLocale}
      >
        {LOCALES.map((option) => {
          const optionLanguage = toMessagesFromLocale(option).language
          return (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              label={
                <Text
                  ref={(element) => {
                    markLanguage(element, option)
                  }}
                >
                  {optionLanguage.name}
                </Text>
              }
              endContent={optionLanguage.code}
            />
          )
        })}
      </DropdownMenuRadioGroup>
    </DropdownMenu>
  )
}
