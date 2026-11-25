import type { Locale } from '../content/locales'
import {
  formatMetricFigure,
  type LargeNumberStyle,
  type MetricFigure,
  type MetricFormat,
} from './format'
import { parseMetricReferences } from './references'

/**
 * Renders the metric references of a prose text (pure). A reference shows the
 * last verified figure with its date; with no verified figure (unknown key, or
 * a source never read yet) it is `unavailable`, never a guessed `0` (DATA-03).
 */

export interface RenderableMetric {
  format: MetricFormat
  reading: { figure: MetricFigure; verifiedAt: number } | null
}

export type RenderedSegment =
  | { kind: 'text'; text: string }
  | { kind: 'metric'; key: string; text: string; verifiedAt: number }
  | { kind: 'unavailable'; key: string }

export function renderMetricReferences(
  text: string,
  metrics: ReadonlyMap<string, RenderableMetric>,
  locale: Locale,
  style: LargeNumberStyle,
): RenderedSegment[] {
  return parseMetricReferences(text).map((segment): RenderedSegment => {
    if (segment.kind === 'text') {
      return segment
    }
    const metric = metrics.get(segment.key)
    if (metric?.reading == null) {
      return { kind: 'unavailable', key: segment.key }
    }
    const { figure, verifiedAt } = metric.reading
    return {
      kind: 'metric',
      key: segment.key,
      text: formatMetricFigure(figure, metric.format, locale, style),
      verifiedAt,
    }
  })
}
