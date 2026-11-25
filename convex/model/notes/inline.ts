/**
 * Inline Markdown of a note (pure): strong, emphasis, inline code and links.
 * The output is runs of plain text with marks, never markup, so whatever a
 * note holds (raw HTML included) can only render as text. A link keeps its
 * address only when it is safe; otherwise its label stays as text.
 */

export type Mark = 'strong' | 'emphasis'

export interface TextRun {
  kind: 'text'
  text: string
  marks: Mark[]
}

export interface CodeRun {
  kind: 'code'
  text: string
}

export interface LinkRun {
  kind: 'link'
  href: string
  children: (TextRun | CodeRun)[]
}

export type ParsedInline = TextRun | CodeRun | LinkRun

/** Characters a backslash turns into plain text. */
const ESCAPABLE = /^[\\`*_[\]()#+\-.!{}>~|:]$/

/** Web and mail addresses, site paths (`/lavori`, not `//host`) and anchors. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/(?!\/)|#)/i

/** The DEL control character; the others are below the space. */
const DELETE_CODE = 0x7f
const SPACE_CODE = 0x20
const BACKSLASH_CODE = 0x5c

/**
 * Browsers drop tabs and newlines from addresses and read `\` as `/`, so
 * `/\host` or `/<tab>/host` would leave the site: never allowed.
 */
function hasUnsafeCharacter(href: string) {
  return Array.from({ length: href.length }, (_, index) =>
    href.charCodeAt(index),
  ).some(
    (code) =>
      code < SPACE_CODE || code === DELETE_CODE || code === BACKSLASH_CODE,
  )
}

/** A stand-in origin to resolve site paths against (never fetched). */
const SITE_ORIGIN = 'https://site.invalid'

const WORD_CHARACTER = /[\p{L}\p{N}]/u
const WHITESPACE = /\s/

/**
 * Whether a link may keep its address: a web or mail address the URL parser
 * reads, an anchor, or a site path that still resolves to the site.
 */
export function isSafeHref(href: string) {
  if (!SAFE_HREF.test(href) || hasUnsafeCharacter(href)) {
    return false
  }
  if (href.startsWith('#')) {
    return true
  }
  if (href.startsWith('/')) {
    return parseUrl(href, SITE_ORIGIN)?.origin === SITE_ORIGIN
  }
  return parseUrl(href) !== null
}

// `URL.parse` is not in every runtime Convex runs on; the constructor is.
function parseUrl(href: string, base?: string): URL | null {
  try {
    return new URL(href, base)
  } catch {
    return null
  }
}

/** The runs of one line or paragraph of inline Markdown, in reading order. */
export function parseInline(text: string): ParsedInline[] {
  return parseRuns(text, [], false)
}

interface Cursor {
  runs: ParsedInline[]
  literal: string
  marks: Mark[]
}

function parseRuns(
  text: string,
  marks: Mark[],
  isInLink: boolean,
): ParsedInline[] {
  const cursor: Cursor = { runs: [], literal: '', marks }
  let index = 0
  while (index < text.length) {
    index = readNext(text, index, cursor, isInLink)
  }
  flushLiteral(cursor)
  return cursor.runs
}

/** Reads what starts at `index` into the cursor; returns where to go on. */
function readNext(
  text: string,
  index: number,
  cursor: Cursor,
  isInLink: boolean,
): number {
  const character = text.charAt(index)
  const next = text.charAt(index + 1)
  if (character === '\\' && ESCAPABLE.test(next)) {
    cursor.literal += next
    return index + 2
  }
  const span =
    readCode(text, index) ??
    readMarked(text, index, cursor.marks) ??
    (isInLink ? null : readLink(text, index, cursor.marks))
  if (span === null) {
    cursor.literal += character
    return index + 1
  }
  flushLiteral(cursor)
  cursor.runs.push(...span.runs)
  return span.end
}

interface Span {
  runs: ParsedInline[]
  end: number
}

function readCode(text: string, index: number): Span | null {
  if (text.charAt(index) !== '`') {
    return null
  }
  const close = text.indexOf('`', index + 1)
  if (close <= index + 1) {
    return null
  }
  return {
    runs: [{ kind: 'code', text: text.slice(index + 1, close) }],
    end: close + 1,
  }
}

function readMarked(text: string, index: number, marks: Mark[]): Span | null {
  const delimiter = toDelimiterAt(text, index)
  if (delimiter === null) {
    return null
  }
  const innerStart = index + delimiter.length
  const close = findCloser(text, delimiter, innerStart)
  if (close === null) {
    return null
  }
  const mark: Mark = delimiter.length === 2 ? 'strong' : 'emphasis'
  return {
    runs: parseRuns(text.slice(innerStart, close), [...marks, mark], false),
    end: close + delimiter.length,
  }
}

/** The delimiter that opens a marked span at `index`, if any. */
function toDelimiterAt(text: string, index: number): string | null {
  const character = text.charAt(index)
  if (character !== '*' && character !== '_') {
    return null
  }
  // An underscore inside a word (`snake_case`) is a character, not a mark.
  if (character === '_' && WORD_CHARACTER.test(text.charAt(index - 1))) {
    return null
  }
  const delimiter =
    text.charAt(index + 1) === character ? character.repeat(2) : character
  const afterOpener = text.charAt(index + delimiter.length)
  return afterOpener === '' || WHITESPACE.test(afterOpener) ? null : delimiter
}

function findCloser(text: string, delimiter: string, from: number) {
  let close = text.indexOf(delimiter, from)
  while (close !== -1) {
    if (isCloser(text, delimiter, close)) {
      return close > from ? close : null
    }
    close = text.indexOf(delimiter, close + 1)
  }
  return null
}

function isCloser(text: string, delimiter: string, close: number) {
  const before = text.charAt(close - 1)
  const after = text.charAt(close + delimiter.length)
  if (WHITESPACE.test(before)) {
    return false
  }
  if (delimiter === '*' && (after === '*' || before === '*')) {
    return false
  }
  return delimiter !== '_' || !WORD_CHARACTER.test(after)
}

function readLink(text: string, index: number, marks: Mark[]): Span | null {
  if (text.charAt(index) !== '[') {
    return null
  }
  const labelEnd = text.indexOf('](', index + 1)
  const hrefEnd = labelEnd === -1 ? -1 : findHrefEnd(text, labelEnd + 2)
  if (labelEnd === -1 || hrefEnd === -1) {
    return null
  }
  const href = text.slice(labelEnd + 2, hrefEnd).trim()
  const children = parseRuns(text.slice(index + 1, labelEnd), marks, true)
  const label = children.filter((run) => run.kind !== 'link')
  return {
    runs: isSafeHref(href) ? [{ kind: 'link', href, children: label }] : label,
    end: hrefEnd + 1,
  }
}

/** The `)` that closes an address, past balanced parentheses inside it. */
function findHrefEnd(text: string, from: number) {
  let depth = 0
  for (let index = from; index < text.length; index += 1) {
    const character = text.charAt(index)
    if (character === '(') {
      depth += 1
    } else if (character === ')') {
      if (depth === 0) {
        return index
      }
      depth -= 1
    }
  }
  return -1
}

function flushLiteral(cursor: Cursor) {
  if (cursor.literal === '') {
    return
  }
  cursor.runs.push({ kind: 'text', text: cursor.literal, marks: cursor.marks })
  cursor.literal = ''
}
