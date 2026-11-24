import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import { defaultThemeSlug, themes } from '../../astryx-themes'
import { readConvexUrl } from '../../shared/config/env'
import { log } from '../../shared/server/log'
import type { Appearance } from './appearance'
import { createAppearanceCssCache } from './appearance-css-cache'
import { toThemeCssFromAppearance } from './to-theme-css-from-appearance'

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
 * A failure is logged here, on the server, and passed on: the callers keep
 * the page up with the CSS they already have.
 */
export const getAppearanceCss = createServerFn({ method: 'GET' }).handler(
  readPublishedAppearanceCss,
)

/** The server function's body, apart so it can be tested without the RPC. */
export async function readPublishedAppearanceCss(): Promise<AppearanceCss> {
  try {
    return await makePublishedAppearanceCss()
  } catch (error) {
    log('appearance css', error)
    throw error
  }
}

async function makePublishedAppearanceCss(): Promise<AppearanceCss> {
  const appearance = await new ConvexHttpClient(readConvexUrl()).query(
    api.appearance.getPublished,
    {},
  )
  const css = CSS_CACHE.readOrMakeCss(appearance, () =>
    toThemeCssFromAppearance(themes[defaultThemeSlug], appearance),
  )
  return { appearance, css }
}
