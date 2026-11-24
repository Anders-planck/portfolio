import type { Appearance } from './appearance-css'

export interface AppearanceCssCache {
  /** The CSS made for `appearance` before, or the result of `makeCss` now. */
  readOrMakeCss: (appearance: Appearance, makeCss: () => string) => string
}

/**
 * Keeps the CSS of the last `capacity` appearances. A Worker isolate serves
 * many requests and the params change rarely, so the Astryx generators run
 * about once per publish per isolate instead of once per page.
 */
export function createAppearanceCssCache(capacity: number): AppearanceCssCache {
  const cssByAppearance = new Map<string, string>()
  return {
    readOrMakeCss: (appearance, makeCss) => {
      const key = JSON.stringify(appearance)
      const css = cssByAppearance.get(key) ?? makeCss()
      // Delete then set moves the key to the newest end of the Map's order.
      cssByAppearance.delete(key)
      cssByAppearance.set(key, css)
      const oldest = cssByAppearance.keys().next()
      if (cssByAppearance.size > capacity && oldest.done !== true) {
        cssByAppearance.delete(oldest.value)
      }
      return css
    },
  }
}
