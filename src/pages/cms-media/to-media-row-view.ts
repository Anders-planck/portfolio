import type {
  MediaEntry,
  MediaUsage,
} from '../../entities/media/media-library-query-options'
import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import { type Locale, LOCALES } from '../../shared/i18n/locale'

const { table: TABLE_COPY, usage: USAGE_COPY } = CMS_MEDIA_MESSAGES

/** How the alt text of a media stands, for its status dot. */
export interface AltStatus {
  tone: 'neutral' | 'error' | 'warning' | 'success'
  label: string
}

export interface MediaRowView {
  /** Size, and pixels for an image: `240 kB · 1440 × 900`. */
  details: string
  usages: string[]
  altStatus: AltStatus
}

const KILOBYTES = new Intl.NumberFormat('it', {
  style: 'unit',
  unit: 'kilobyte',
  maximumFractionDigits: 0,
})

export function toMediaRowViewFromEntry(entry: MediaEntry): MediaRowView {
  const size = KILOBYTES.format(Math.max(1, Math.round(entry.bytes / 1000)))
  const pixels =
    entry.widthPx === null || entry.heightPx === null
      ? null
      : `${String(entry.widthPx)} × ${String(entry.heightPx)}`
  return {
    details: pixels === null ? size : `${size} · ${pixels}`,
    usages: entry.usages.map(toUsageLabel),
    altStatus: toAltStatus(entry),
  }
}

/** Field labels by field path; a path without one is shown as it is. */
const FIELD_LABELS: Readonly<Record<string, string>> = USAGE_COPY.fields

function toUsageLabel({ collection, field, state }: MediaUsage) {
  const fieldLabel = FIELD_LABELS[field] ?? field
  return `${USAGE_COPY.collections[collection]} · ${fieldLabel} · ${USAGE_COPY.states[state]}`
}

function toLocaleList(locales: readonly Locale[]) {
  return locales.map((locale) => locale.toUpperCase()).join(', ')
}

/** Missing alt blocks publish, so it wins over alt still to review. */
function toAltStatus({ kind, alts }: MediaEntry): AltStatus {
  if (kind === 'file') {
    return { tone: 'neutral', label: TABLE_COPY.altNotNeeded }
  }
  const missing = LOCALES.filter(
    (locale) =>
      !alts.some((record) => record.locale === locale && record.alt !== ''),
  )
  if (missing.length > 0) {
    return {
      tone: 'error',
      label: TABLE_COPY.altMissing(toLocaleList(missing)),
    }
  }
  const toReview = alts
    .filter((record) => record.reviewState === 'to-review')
    .map((record) => record.locale)
  if (toReview.length > 0) {
    return {
      tone: 'warning',
      label: TABLE_COPY.altToReview(toLocaleList(toReview)),
    }
  }
  return { tone: 'success', label: TABLE_COPY.altComplete }
}
