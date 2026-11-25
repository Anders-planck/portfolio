/**
 * Metric references (ADR 0004): `{{m:<key>}}` inside prose is the only way to
 * put a figure in free text. Pure: no Convex context, no network.
 */

/** A metric key: lowercase words joined by hyphens, e.g. `sdk-commits`. */
const KEY_SOURCE = '[a-z][a-z0-9]*(?:-[a-z0-9]+)*'

const METRIC_KEY_PATTERN = new RegExp(`^${KEY_SOURCE}$`)

const REFERENCE_PATTERN = new RegExp(`\\{\\{m:(${KEY_SOURCE})\\}\\}`, 'g')

export type ReferenceSegment =
  { kind: 'text'; text: string } | { kind: 'reference'; key: string }

export function isMetricKey(value: string) {
  return METRIC_KEY_PATTERN.test(value)
}

/** Splits prose into text and metric references, in reading order. */
export function parseMetricReferences(text: string): ReferenceSegment[] {
  const matches = [...text.matchAll(REFERENCE_PATTERN)]
  const ends = matches.map((match) => match.index + match[0].length)
  const starts = [0, ...ends]
  const segments = matches.flatMap((match, position): ReferenceSegment[] => [
    { kind: 'text', text: text.slice(starts[position], match.index) },
    { kind: 'reference', key: match[1] ?? '' },
  ])
  const tail: ReferenceSegment = {
    kind: 'text',
    text: text.slice(starts.at(-1)),
  }
  return [...segments, tail].filter(
    (segment) => segment.kind === 'reference' || segment.text !== '',
  )
}

// Anything in double braces: a reference, or text that tried to be one.
const BRACED_PATTERN = /\{\{[^{}]*\}\}/g

/** Double-braced text that is not a valid reference (`{{ m:sdk }}`, `{{M:sdk}}`). */
export function findMalformedReferences(text: string): string[] {
  return [...text.matchAll(BRACED_PATTERN)]
    .map(([braced]) => braced)
    .filter((braced) => parseMetricReferences(braced)[0]?.kind !== 'reference')
}

/** The metric keys a text refers to, each once, in reading order. */
export function listReferencedMetricKeys(text: string): string[] {
  const keys = parseMetricReferences(text).flatMap((segment) =>
    segment.kind === 'reference' ? [segment.key] : [],
  )
  return [...new Set(keys)]
}
