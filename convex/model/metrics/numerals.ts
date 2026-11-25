import { parseMetricReferences } from './references'

/**
 * The free-numeral rule (ADR 0004), pure: a figure in prose must be a metric
 * reference. Allowed: four-digit years 1990–2099, digits inside a word or a
 * technical name (`i18n`, `OAuth2`, `R2`) and the dimension terms `2D`/`3D`.
 * Dedicated date and period fields are not prose, so callers never pass them.
 */

const FIRST_YEAR = 1990
const LAST_YEAR = 2099

/** Words that start with a digit but are names, not figures. */
const DIGIT_TERMS: ReadonlySet<string> = new Set(['2d', '3d'])

// A run of digits (with its grouping or decimal marks) that does not start
// inside a word or a number (`i18n`, `v8.4`), followed by any letters glued to
// it (`10k`, `3D`).
const NUMERAL_PATTERN =
  /(?<![\p{L}\p{N}_]|[\p{L}\p{N}][.,])(\d+(?:[.,]\d+)*)(\p{L}*)/gu

function isAllowedYear(numeral: string) {
  if (!/^\d{4}$/.test(numeral)) {
    return false
  }
  const year = Number(numeral)
  return year >= FIRST_YEAR && year <= LAST_YEAR
}

function isDigitTerm(numeral: string, glued: string) {
  return DIGIT_TERMS.has(`${numeral}${glued}`.toLowerCase())
}

function toTextWithoutReferences(text: string) {
  return parseMetricReferences(text)
    .map((segment) => (segment.kind === 'text' ? segment.text : ' '))
    .join('')
}

/** The free numerals in a prose text, in reading order. */
export function findFreeNumerals(text: string): string[] {
  const prose = toTextWithoutReferences(text)
  return [...prose.matchAll(NUMERAL_PATTERN)]
    .map(([, numeral = '', glued = '']) => ({ numeral, glued }))
    .filter(
      ({ numeral, glued }) =>
        !isAllowedYear(numeral) && !isDigitTerm(numeral, glued),
    )
    .map(({ numeral }) => numeral)
}
