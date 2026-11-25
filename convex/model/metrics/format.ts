import { type Infer, v } from 'convex/values'

import type { Locale } from '../content/locales'

/**
 * How a metric's figure is written, per locale (pure). The grouping follows
 * the page locale; `useGrouping: 'always'` because Italian CLDR data leaves
 * four-digit numbers ungrouped and the site writes `8.489`.
 */

/** `count` 8.489 · `count-of-total` 157/157 · `at-least` 750+ (a manual lower bound). */
export const metricFormatValidator = v.union(
  v.literal('count'),
  v.literal('count-of-total'),
  v.literal('at-least'),
)
export type MetricFormat = Infer<typeof metricFormatValidator>

/** The owner's rounding choice for figures above ten thousand. */
export const largeNumberStyleValidator = v.union(
  v.literal('exact'),
  v.literal('compact'),
)
export type LargeNumberStyle = Infer<typeof largeNumberStyleValidator>

/** A verified figure: the count and, for `count-of-total`, what it is out of. */
export interface MetricFigure {
  value: number
  total: number | null
}

const COMPACT_ABOVE = 10_000
const THOUSAND = 1000

function formatNumber(value: number, locale: Locale, style: LargeNumberStyle) {
  const format = new Intl.NumberFormat(locale, { useGrouping: 'always' })
  if (style === 'compact' && value > COMPACT_ABOVE) {
    // Rounded down, so the shown figure is never more than the verified one.
    return {
      text: `${format.format(Math.floor(value / THOUSAND))}k+`,
      isLowerBound: true,
    }
  }
  return { text: format.format(value), isLowerBound: false }
}

export function formatMetricFigure(
  figure: MetricFigure,
  format: MetricFormat,
  locale: Locale,
  style: LargeNumberStyle,
): string {
  const count = formatNumber(figure.value, locale, style)
  switch (format) {
    case 'count': {
      return count.text
    }
    case 'count-of-total': {
      if (figure.total === null) {
        return count.text
      }
      // The total is what the count is out of, not a lower bound: never «k+».
      const total = formatNumber(figure.total, locale, 'exact')
      return `${count.text}/${total.text}`
    }
    case 'at-least': {
      return count.isLowerBound ? count.text : `${count.text}+`
    }
  }
}
