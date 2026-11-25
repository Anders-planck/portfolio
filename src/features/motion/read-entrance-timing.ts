/** How an entrance plays: the theme's slow duration and entrance curve. */
export interface EntranceTiming {
  durationMs: number
  easing: string
}

/** `700ms` or `0.7s` in milliseconds; anything else is no duration at all. */
export function toMillisecondsFromCssTime(cssTime: string): number {
  const time = cssTime.trim()
  const amount = Number.parseFloat(time)
  if (Number.isNaN(amount)) {
    return 0
  }
  if (time.endsWith('ms')) {
    return amount
  }
  return time.endsWith('s') ? amount * 1000 : 0
}

/**
 * Reads the timing tokens where `element` sits. The published tempo scales
 * the theme durations and the published character sets the entrance curve
 * (ADR 0010), so an entrance follows both without reading the params here.
 */
export function readEntranceTiming(element: Element): EntranceTiming {
  const style = getComputedStyle(element)
  const easing = style.getPropertyValue('--ease-entrance').trim()
  return {
    durationMs: toMillisecondsFromCssTime(
      style.getPropertyValue('--duration-slow'),
    ),
    // Before the theme CSS applies there is no token; the browser curve is
    // the closest stand-in.
    easing: easing === '' ? 'ease-out' : easing,
  }
}
