import { isMetricKey } from '../metrics/references'
import { createAnchorIssuer } from './anchors'
import {
  type DirectiveLine,
  isContainerClose,
  isDirectiveLine,
  parseDirectiveLine,
} from './directive'
import { type ParsedInline, parseInline } from './inline'
import {
  BLANK,
  FENCE,
  HEADING,
  isFenceClose,
  lineAt,
  type ParsedSimpleBlock,
  QUOTE,
  readFence,
  readList,
  readParagraph,
  readQuote,
  toListItemText,
} from './simpleblocks'

/**
 * A note's Markdown (pure): paragraphs, two heading levels, lists, quotes,
 * fenced code, and three directives: `:::case{title}` (a box with simple
 * blocks), `::metric[label]{key}` (a metric figure, ADR 0004) and
 * `::figure[caption]{media}` (an image from media). Anything it cannot read
 * becomes text or a problem, never markup; problems are what the note rule
 * reports to the owner, and they render nothing.
 */

export type { ParsedSimpleBlock }

export type ParsedBlock =
  | ParsedSimpleBlock
  | { kind: 'heading'; level: 2 | 3; id: string; inlines: ParsedInline[] }
  | {
      kind: 'case'
      id: string
      title: ParsedInline[]
      blocks: ParsedSimpleBlock[]
    }
  | { kind: 'metric'; key: string; label: ParsedInline[] }
  | { kind: 'figure'; mediaId: string; caption: ParsedInline[] }

export type MarkdownProblem =
  | {
      kind:
        | 'unknown-directive'
        | 'malformed-directive'
        | 'unclosed-directive'
        | 'nested-block'
        | 'unclosed-fence'
      name: string
      /** 1-based line of the note body. */
      line: number
    }
  | { kind: 'missing-attribute'; name: string; attribute: string; line: number }

export interface ParsedNote {
  blocks: ParsedBlock[]
  problems: MarkdownProblem[]
}

interface Reader {
  lines: string[]
  problems: MarkdownProblem[]
  issueAnchor: (title: string) => string
  /** Inside a case: only simple blocks. */
  isNested: boolean
}

interface Read {
  block: ParsedBlock | null
  next: number
}

export function parseNoteMarkdown(body: string): ParsedNote {
  const reader: Reader = {
    lines: body.split(/\r?\n/),
    problems: [],
    issueAnchor: createAnchorIssuer(),
    isNested: false,
  }
  return {
    blocks: readBlocks(reader, 0, reader.lines.length),
    problems: reader.problems,
  }
}

function readBlocks(reader: Reader, from: number, to: number): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  let index = from
  while (index < to) {
    if (BLANK.test(lineAt(reader.lines, index))) {
      index += 1
      continue
    }
    const { block, next } = readBlockAt(reader, index, to)
    if (block !== null) {
      blocks.push(block)
    }
    index = next
  }
  return blocks
}

function readBlockAt(reader: Reader, index: number, to: number): Read {
  const line = lineAt(reader.lines, index)
  const fence = FENCE.exec(line)
  if (fence !== null) {
    return readCheckedFence(reader, index, to, fence)
  }
  if (isDirectiveLine(line)) {
    return readDirectiveLine(reader, index, to)
  }
  const heading = HEADING.exec(line)
  if (heading !== null) {
    return reader.isNested
      ? skipNested(reader, index, 'heading')
      : readHeading(reader, index, heading)
  }
  if (toListItemText(line) !== null) {
    return readList(reader.lines, index, to)
  }
  if (QUOTE.test(line)) {
    return readQuote(reader.lines, index, to)
  }
  return readParagraph(reader.lines, index, to)
}

function readCheckedFence(
  reader: Reader,
  index: number,
  to: number,
  fence: RegExpExecArray,
): Read {
  const { block, next, isClosed } = readFence(reader.lines, index, to, fence)
  if (!isClosed) {
    reader.problems.push({
      kind: 'unclosed-fence',
      name: fence[2] ?? '',
      line: index + 1,
    })
  }
  return { block, next }
}

function readDirectiveLine(reader: Reader, index: number, to: number): Read {
  const directive = parseDirectiveLine(lineAt(reader.lines, index))
  if (directive === null) {
    reader.problems.push({
      kind: 'malformed-directive',
      name: '',
      line: index + 1,
    })
    return { block: null, next: index + 1 }
  }
  return reader.isNested
    ? skipNested(reader, index, directive.name)
    : readDirective(reader, index, to, directive)
}

function skipNested(reader: Reader, index: number, name: string): Read {
  reader.problems.push({ kind: 'nested-block', name, line: index + 1 })
  return { block: null, next: index + 1 }
}

function readHeading(
  reader: Reader,
  index: number,
  [, hashes = '', text = '']: RegExpExecArray,
): Read {
  return {
    block: {
      kind: 'heading',
      level: hashes.length <= 2 ? 2 : 3,
      id: reader.issueAnchor(text),
      inlines: parseInline(text),
    },
    next: index + 1,
  }
}

function readDirective(
  reader: Reader,
  index: number,
  to: number,
  directive: DirectiveLine,
): Read {
  if (directive.form === 'container') {
    return readContainer(reader, index, to, directive)
  }
  return { block: toLeafBlock(reader, index + 1, directive), next: index + 1 }
}

function readContainer(
  reader: Reader,
  index: number,
  to: number,
  directive: DirectiveLine,
): Read {
  const line = index + 1
  const close = findContainerClose(reader.lines, index + 1, to)
  if (close === to) {
    reader.problems.push({
      kind: 'unclosed-directive',
      name: directive.name,
      line,
    })
  }
  const next = Math.min(close + 1, to)
  if (directive.name !== 'case') {
    reader.problems.push({
      kind: 'unknown-directive',
      name: directive.name,
      line,
    })
    return { block: null, next }
  }
  const title = readAttribute({
    reader,
    line,
    directive,
    attribute: 'title',
  })
  const blocks = readBlocks({ ...reader, isNested: true }, index + 1, close)
  if (title === null) {
    return { block: null, next }
  }
  const caseBlocks = blocks.filter(isSimpleBlock)
  return {
    block: {
      kind: 'case',
      id: reader.issueAnchor(title),
      title: parseInline(title),
      blocks: caseBlocks,
    },
    next,
  }
}

/** The `:::` that closes a container, skipping fenced code; `to` if none. */
function findContainerClose(lines: string[], from: number, to: number) {
  let openFence: string | null = null
  for (let index = from; index < to; index += 1) {
    const line = lineAt(lines, index)
    if (openFence !== null) {
      openFence = isFenceClose(line, openFence) ? null : openFence
    } else if (isContainerClose(line)) {
      return index
    } else {
      openFence = FENCE.exec(line)?.[1] ?? null
    }
  }
  return to
}

function isSimpleBlock(block: ParsedBlock): block is ParsedSimpleBlock {
  return (
    block.kind === 'paragraph' ||
    block.kind === 'list' ||
    block.kind === 'quote' ||
    block.kind === 'code'
  )
}

function toLeafBlock(
  reader: Reader,
  line: number,
  directive: DirectiveLine,
): ParsedBlock | null {
  const label = parseInline(directive.label ?? '')
  if (directive.name === 'metric') {
    const key = readAttribute({
      reader,
      line,
      directive,
      attribute: 'key',
      isValid: isMetricKey,
    })
    return key === null ? null : { kind: 'metric', key, label }
  }
  if (directive.name === 'figure') {
    const mediaId = readAttribute({
      reader,
      line,
      directive,
      attribute: 'media',
    })
    return mediaId === null ? null : { kind: 'figure', mediaId, caption: label }
  }
  reader.problems.push({
    kind: 'unknown-directive',
    name: directive.name,
    line,
  })
  return null
}

interface AttributeRead {
  reader: Reader
  line: number
  directive: DirectiveLine
  attribute: string
  isValid?: (value: string) => boolean
}

/** A required attribute, or null after recording why it is missing. */
function readAttribute({
  reader,
  line,
  directive: { name, attributes },
  attribute,
  isValid = (value) => value.trim() !== '',
}: AttributeRead): string | null {
  if (attributes === null) {
    reader.problems.push({ kind: 'malformed-directive', name, line })
    return null
  }
  const value = attributes.get(attribute)
  if (value === undefined || !isValid(value)) {
    reader.problems.push({ kind: 'missing-attribute', name, attribute, line })
    return null
  }
  return value
}
