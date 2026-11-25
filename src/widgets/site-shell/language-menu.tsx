import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu'
import { Text } from '@astryxdesign/core/Text'
import { useLocation, useNavigate } from '@tanstack/react-router'

import { isLocale, LOCALES, toHrefInLocale } from '../../shared/i18n/locale'
import { toMessagesFromLocale } from '../../shared/i18n/to-messages-from-locale'
import { useLocale } from '../../shared/i18n/use-locale'
import { useMessages } from '../../shared/i18n/use-messages'

/**
 * The language menu: the same page in another locale, query and anchor
 * kept. Astryx gives the keyboard, Esc and focus return.
 */
export function LanguageMenu() {
  const locale = useLocale()
  const { language } = useMessages()
  const location = useLocation()
  const navigate = useNavigate()

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
              label={optionLanguage.name}
              endContent={optionLanguage.code}
            />
          )
        })}
      </DropdownMenuRadioGroup>
    </DropdownMenu>
  )
}
