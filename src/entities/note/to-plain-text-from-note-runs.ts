import type { NoteInlineRun } from './note-query-options'

/**
 * Runs as plain text, for places that take a string (the page title, the
 * SEO description). A metric without a figure reads as `unavailableText`.
 */
export function toPlainTextFromNoteRuns(
  runs: readonly NoteInlineRun[],
  unavailableText: string,
): string {
  return runs
    .map((run) => {
      switch (run.kind) {
        case 'link':
          return toPlainTextFromNoteRuns(run.children, unavailableText)
        case 'unavailable':
          return unavailableText
        default:
          return run.text
      }
    })
    .join('')
}
