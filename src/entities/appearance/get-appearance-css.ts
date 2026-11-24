import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import { defaultThemeSlug, themes } from '../../astryx-themes'
import { readConvexUrl } from '../../shared/config/env'
import { type Appearance, toThemeCssFromAppearance } from './appearance-css'
import { createAppearanceCssCache } from './appearance-css-cache'

export interface AppearanceCss {
  /** The params the CSS was made from. */
  appearance: Appearance
  css: string
}

const CSS_CACHE = createAppearanceCssCache(4)

/**
 * The CSS of the published appearance (ADR 0010). It runs only on the Worker,
 * so the Astryx generators never ship to the browser. It reads the params
 * itself, from Convex, so a caller cannot make it generate arbitrary CSS.
 */
export const getAppearanceCss = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AppearanceCss> => {
    const appearance = await new ConvexHttpClient(readConvexUrl()).query(
      api.appearance.getPublished,
      {},
    )
    const css = CSS_CACHE.readOrMakeCss(appearance, () =>
      toThemeCssFromAppearance(themes[defaultThemeSlug], appearance),
    )
    return { appearance, css }
  },
)
