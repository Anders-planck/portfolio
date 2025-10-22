'use client'

import { usePathname } from 'next/navigation'
import { locales } from '@/i18n/config'

export default function HreflangLinks() {
  const pathname = usePathname()

  // Remove locale from pathname to get base path
  const getBasePath = () => {
    const segments = pathname.split('/')
    // Remove first two segments (empty string and locale)
    return segments.slice(2).join('/') || ''
  }

  const basePath = getBasePath()

  return (
    <>
      {/* Hreflang tags for all locales */}
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`https://anders-games.com/${locale}${basePath ? `/${basePath}` : ''}`}
        />
      ))}
      {/* x-default points to English */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://anders-games.com/en${basePath ? `/${basePath}` : ''}`}
      />
    </>
  )
}
