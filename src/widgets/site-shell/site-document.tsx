import { Theme } from '@astryxdesign/core/theme'
import { HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { defaultThemeSlug, themes } from '../../astryx-themes'
import { toHtmlDataThemeFromMode } from '../../entities/appearance/appearance'
import { useAppearance } from '../../entities/appearance/use-appearance'
import { useLocale } from '../../shared/i18n/use-locale'
import { SiteShell } from './site-shell'

const SITE_THEME = themes[defaultThemeSlug]

/**
 * The HTML document of every page: the locale on `<html lang>`, the
 * published appearance (ADR 0010) and the shell around the page.
 */
export function SiteDocument({ children }: { children: ReactNode }) {
  const { appearance, css } = useAppearance()
  const { mode } = appearance.theme
  const locale = useLocale()
  return (
    // The mode is on <html> from the server; <Theme> keeps it in sync.
    <html
      lang={locale}
      data-astryx-theme={SITE_THEME.name}
      data-theme={toHtmlDataThemeFromMode(mode)}
    >
      <head>
        <HeadContent />
        {/* After the built theme stylesheet, so the params win by order. */}
        {css === undefined ? null : (
          <style data-appearance="" dangerouslySetInnerHTML={{ __html: css }} />
        )}
      </head>
      {/* Hides the system cursor only while Cursor draws its own. */}
      <body className="data-custom-cursor:**:cursor-none">
        <Theme theme={SITE_THEME} mode={mode}>
          <SiteShell>{children}</SiteShell>
        </Theme>
        <Scripts />
      </body>
    </html>
  )
}
