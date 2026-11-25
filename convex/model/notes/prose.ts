import { listReferencedMetricKeys } from '../metrics/references'
import type { ParsedInline } from './inline'
import type { ParsedBlock } from './markdown'

/**
 * The prose of a note body (pure): every text a reader reads, where figures
 * must be metric references (ADR 0004). Code, link addresses and directive
 * attributes are not prose, so the free-numeral rule never sees them.
 */
export function toProseTextsFromNoteBody(blocks: ParsedBlock[]): string[] {
  return blocks
    .flatMap(toProseInlinesFromBlock)
    .map(toProseTextFromInlines)
    .filter((text) => text !== '')
}

/** The metric keys a body names, in prose references and metric directives. */
export function listNoteMetricKeys(blocks: ParsedBlock[]): string[] {
  const keys = [
    ...toProseTextsFromNoteBody(blocks).flatMap(listReferencedMetricKeys),
    ...blocks.flatMap((block) => (block.kind === 'metric' ? [block.key] : [])),
  ]
  return [...new Set(keys)]
}

function toProseInlinesFromBlock(block: ParsedBlock): ParsedInline[][] {
  switch (block.kind) {
    case 'heading':
    case 'paragraph':
      return [block.inlines]
    case 'list':
      return block.items
    case 'quote':
      return block.paragraphs
    case 'case':
      return [block.title, ...block.blocks.flatMap(toProseInlinesFromBlock)]
    case 'metric':
      return [block.label]
    case 'figure':
      return [block.caption]
    case 'code':
      return []
  }
}

function toProseTextFromInlines(inlines: ParsedInline[]): string {
  return inlines
    .map((run) => {
      switch (run.kind) {
        case 'text':
          return run.text
        case 'link':
          return toProseTextFromInlines(run.children)
        case 'code':
          return ''
      }
    })
    .join('')
}
