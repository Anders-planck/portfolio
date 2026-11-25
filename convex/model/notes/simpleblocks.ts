import { isDirectiveLine } from './directive'
import { type ParsedInline, parseInline } from './inline'

/**
 * The simple blocks of a note's Markdown (pure): paragraphs, lists, quotes
 * and fenced code, the blocks a case may hold. Each reader takes the body's
 * lines and the line it starts at, and says where the next block starts.
 */

export type ParsedSimpleBlock =
  | { kind: 'paragraph'; inlines: ParsedInline[] }
  | { kind: 'list'; isOrdered: boolean; items: ParsedInline[][] }
  | { kind: 'quote'; paragraphs: ParsedInline[][] }
  | { kind: 'code'; language: string | null; text: string }

export interface SimpleRead {
  block: ParsedSimpleBlock
  next: number
}

export const BLANK = /^\s*$/
export const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/
export const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*$/
const UNORDERED_ITEM = /^\s{0,3}[-*+]\s+(.*)$/
const ORDERED_ITEM = /^\s{0,3}\d{1,9}[.)]\s+(.*)$/
export const QUOTE = /^\s{0,3}>\s?(.*)$/

export function lineAt(lines: string[], index: number) {
  return lines[index] ?? ''
}

export function startsBlock(line: string) {
  return (
    BLANK.test(line) ||
    FENCE.test(line) ||
    HEADING.test(line) ||
    QUOTE.test(line) ||
    isDirectiveLine(line) ||
    toListItemText(line) !== null
  )
}

export function toListItemText(line: string) {
  return (UNORDERED_ITEM.exec(line) ?? ORDERED_ITEM.exec(line))?.[1] ?? null
}

/** Whether a line closes the fence opened with `marker` (as long or longer). */
export function isFenceClose(line: string, marker: string) {
  const trimmed = line.trim()
  return (
    trimmed.startsWith(marker) &&
    trimmed.replaceAll(marker.charAt(0), '') === ''
  )
}

/** A fenced code block; `isClosed` is false when the note ends inside it. */
export function readFence(
  lines: string[],
  index: number,
  to: number,
  [, marker = '', language = '']: RegExpExecArray,
): SimpleRead & { isClosed: boolean } {
  let close = index + 1
  while (close < to && !isFenceClose(lineAt(lines, close), marker)) {
    close += 1
  }
  return {
    block: {
      kind: 'code',
      language: language === '' ? null : language,
      text: lines.slice(index + 1, close).join('\n'),
    },
    next: close + 1,
    isClosed: close < to,
  }
}

export function readList(
  lines: string[],
  index: number,
  to: number,
): SimpleRead {
  const isOrdered = ORDERED_ITEM.test(lineAt(lines, index))
  const items: string[] = []
  let next = index
  while (next < to) {
    const line = lineAt(lines, next)
    const itemText = toListItemText(line)
    if (itemText !== null && ORDERED_ITEM.test(line) === isOrdered) {
      items.push(itemText.trim())
    } else if (items.length > 0 && !startsBlock(line)) {
      items[items.length - 1] = `${items.at(-1) ?? ''} ${line.trim()}`
    } else {
      break
    }
    next += 1
  }
  return {
    block: { kind: 'list', isOrdered, items: items.map(parseInline) },
    next,
  }
}

export function readQuote(
  lines: string[],
  index: number,
  to: number,
): SimpleRead {
  const quoted: string[] = []
  let next = index
  while (next < to) {
    const match = QUOTE.exec(lineAt(lines, next))
    if (match === null) {
      break
    }
    quoted.push(match[1] ?? '')
    next += 1
  }
  const paragraphs = quoted
    .join('\n')
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.trim())
        .join(' ')
        .trim(),
    )
    .filter((paragraph) => paragraph !== '')
    .map(parseInline)
  return { block: { kind: 'quote', paragraphs }, next }
}

export function readParagraph(
  lines: string[],
  index: number,
  to: number,
): SimpleRead {
  const paragraph = [lineAt(lines, index).trim()]
  let next = index + 1
  while (next < to && !startsBlock(lineAt(lines, next))) {
    paragraph.push(lineAt(lines, next).trim())
    next += 1
  }
  return {
    block: { kind: 'paragraph', inlines: parseInline(paragraph.join(' ')) },
    next,
  }
}
