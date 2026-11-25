import { parseMetricReferences } from './references'

/**
 * The free-numeral rule (ADR 0004), pure: a figure in prose must be a metric
 * reference. Allowed: a bare four-digit year 1990–2099 (nothing glued to it)
 * and the technical names listed below. Every other digit of any script
 * (`\p{N}`: decimal digits, superscripts, numeral letters) is a figure.
 * Dedicated date and period fields are not prose, so callers never pass them.
 */

const FIRST_YEAR = 1990
const LAST_YEAR = 2099

/** Names that contain digits but are not figures, lowercase. */
const TECHNICAL_NAMES: ReadonlySet<string> = new Set([
  'i18n',
  'l10n',
  'a11y',
  'oauth2',
  'http2',
  'r2',
  's3',
  'ec2',
  'v8',
  '2d',
  '3d',
])
/** Versioned names: `ES5`, `ES2015`, `v8.4`. */
const VERSIONED_NAME_PATTERN = /^(?:es(?:5|6|20\d{2})|v\d+(?:\.\d+)+)$/

// A word: letters and digits, with grouping or decimal marks between digits
// (`8.489`, `1,5`, `v8.4`). A mark between a letter and a digit joins them too
// (`Esperienza.10`), so a figure glued to a word is never a name.
const WORD_PATTERN = /[\p{L}\p{N}]+(?:[.,][\p{L}\p{N}]+)*/gu
const NUMERAL_PATTERN = /\p{N}+(?:[.,]\p{N}+)*/gu
/** Signs that turn a year into a quantity: `2024%`. */
const QUANTITY_SIGNS = new Set(['%', '‰', '°'])

function isTechnicalName(word: string) {
  const lower = word.toLowerCase()
  return TECHNICAL_NAMES.has(lower) || VERSIONED_NAME_PATTERN.test(lower)
}

function isBareYear(word: string, nextCharacter: string) {
  if (!/^[0-9]{4}$/.test(word) || QUANTITY_SIGNS.has(nextCharacter)) {
    return false
  }
  const year = Number(word)
  return year >= FIRST_YEAR && year <= LAST_YEAR
}

function toTextWithoutReferences(text: string) {
  return parseMetricReferences(text)
    .map((segment) => (segment.kind === 'text' ? segment.text : ' '))
    .join('')
}

/** The free numerals in a prose text, in reading order. */
export function findFreeNumerals(text: string): string[] {
  const prose = toTextWithoutReferences(text)
  return [...prose.matchAll(WORD_PATTERN)].flatMap((match) => {
    const [word] = match
    const nextCharacter = prose.charAt(match.index + word.length)
    if (isTechnicalName(word) || isBareYear(word, nextCharacter)) {
      return []
    }
    return [...word.matchAll(NUMERAL_PATTERN)].map(([numeral]) => numeral)
  })
}
