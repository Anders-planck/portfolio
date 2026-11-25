/**
 * Anchors of a note's sections (pure): the `id` of a heading or a case, what
 * the Outline links to and a shared `#anchor` opens. Readable words, unique
 * in the note (`il-metodo`, then `il-metodo-2`).
 */

const FALLBACK_ANCHOR = 'sezione'

function toAnchorBase(text: string) {
  const base = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return base === '' ? FALLBACK_ANCHOR : base
}

/** Gives each title an anchor unique among the ones given before it. */
export function createAnchorIssuer() {
  const counts = new Map<string, number>()
  return (title: string) => {
    const base = toAnchorBase(title)
    const count = (counts.get(base) ?? 0) + 1
    counts.set(base, count)
    return count === 1 ? base : `${base}-${String(count)}`
  }
}
