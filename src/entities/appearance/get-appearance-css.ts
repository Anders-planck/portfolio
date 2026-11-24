import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import { defaultThemeSlug, themes } from '../../astryx-themes'
import { readConvexUrl } from '../../shared/config/env'
import { toThemeCssFromAppearance } from './appearance-css'

/**
 * The CSS of the published appearance (ADR 0010). It runs only on the Worker,
 * so the Astryx generators never ship to the browser. It reads the params
 * itself, from Convex, so a caller cannot make it generate arbitrary CSS.
 */
export const getAppearanceCss = createServerFn({ method: 'GET' }).handler(
  async () => {
    const appearance = await new ConvexHttpClient(readConvexUrl()).query(
      api.appearance.getPublished,
      {},
    )
    const key = JSON.stringify(appearance)
    const cached = CSS_BY_APPEARANCE.get(key)
    if (cached !== undefined) {
      return cached
    }
    const css = toThemeCssFromAppearance(themes[defaultThemeSlug], appearance)
    rememberCss(key, css)
    return css
  },
)

// A Worker isolate serves many requests and the params change rarely: keep
// the last few results so the generators run once per publish per isolate.
const CSS_BY_APPEARANCE = new Map<string, string>()
const CACHE_SIZE = 4

function rememberCss(key: string, css: string) {
  const oldest = CSS_BY_APPEARANCE.keys().next()
  if (CSS_BY_APPEARANCE.size >= CACHE_SIZE && oldest.done !== true) {
    CSS_BY_APPEARANCE.delete(oldest.value)
  }
  CSS_BY_APPEARANCE.set(key, css)
}
