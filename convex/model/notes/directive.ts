/**
 * Directive lines of a note (pure), in the generic directive syntax:
 * `::name[label]{key="value"}` on its own line is a leaf, `:::name{…}` opens
 * a container that a line of `:::` closes.
 */

export interface DirectiveLine {
  form: 'leaf' | 'container'
  name: string
  label: string | null
  /** Null when the braces do not hold `key="value"` pairs only. */
  attributes: ReadonlyMap<string, string> | null
}

const DIRECTIVE_LINE =
  /^(?<colons>:{2,3})(?<name>[a-z][a-z-]*)(?:\[(?<label>[^\]]*)\])?(?:\{(?<attributes>[^}]*)\})?\s*$/

const ATTRIBUTE = /([a-z][a-z-]*)="([^"]*)"/g
const ATTRIBUTE_SEPARATOR = /^\s*$/

/**
 * Whether a line is written as a directive (it starts with `::`), parsed or
 * not: one that does not parse is a problem, never text.
 */
export function isDirectiveLine(line: string) {
  return line.trim().startsWith('::')
}

export function isContainerClose(line: string) {
  return /^:::\s*$/.test(line)
}

/** The directive a line holds, or null when it is not a directive line. */
export function parseDirectiveLine(line: string): DirectiveLine | null {
  const match = DIRECTIVE_LINE.exec(line.trim())
  const groups = match?.groups
  if (groups === undefined) {
    return null
  }
  return {
    form: groups.colons === ':::' ? 'container' : 'leaf',
    name: groups.name ?? '',
    label: groups.label ?? null,
    attributes: parseAttributes(groups.attributes ?? ''),
  }
}

function parseAttributes(source: string): ReadonlyMap<string, string> | null {
  const pairs = [...source.matchAll(ATTRIBUTE)]
  const leftover = source.replace(ATTRIBUTE, '')
  if (!ATTRIBUTE_SEPARATOR.test(leftover)) {
    return null
  }
  return new Map(pairs.map(([, key = '', value = '']) => [key, value]))
}
