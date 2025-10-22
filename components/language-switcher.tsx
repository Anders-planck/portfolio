'use client'

import * as React from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check, Languages } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'

export default function LanguageSwitcher() {
  const t = useTranslations('common.languageSwitcher')
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [open, setOpen] = React.useState(false)

  const currentLocale = (params.locale as Locale) || 'en'

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setOpen(false)
      return
    }

    // Save preference in cookie (expires in 1 year)
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    document.cookie = `NEXT_LOCALE=${newLocale}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`

    // Replace the locale in the pathname
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPathname = segments.join('/')

    router.push(newPathname)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          aria-label={t('selectLanguage')}
        >
          <Languages className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                currentLocale === locale && 'bg-accent'
              )}
            >
              <span className="text-lg">{localeFlags[locale]}</span>
              <span className="flex-1 text-left">{localeNames[locale]}</span>
              <span className="text-xs text-muted-foreground uppercase">
                {locale}
              </span>
              {currentLocale === locale && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
