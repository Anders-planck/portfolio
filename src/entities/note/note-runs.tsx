import { Code } from '@astryxdesign/core/Code'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import type { ReactNode } from 'react'

import { useMessages } from '../../shared/i18n/use-messages'
import type { NoteInlineRun } from './note-query-options'

type Marks = Extract<NoteInlineRun, { kind: 'text' }>['marks']

/**
 * Inline runs of a note as text components: the backend already turned the
 * Markdown into plain runs and metric references into verified figures, so
 * nothing here can inject markup.
 */
export function NoteRuns({ runs }: { runs: NoteInlineRun[] }) {
  return runs.map((run, position) => (
    // Runs never move, so their position is a stable key.
    <NoteRun key={position} run={run} />
  ))
}

function NoteRun({ run }: { run: NoteInlineRun }) {
  const { notes } = useMessages()
  switch (run.kind) {
    case 'text':
      return <MarkedText marks={run.marks}>{run.text}</MarkedText>
    case 'metric':
      return <MarkedText marks={run.marks}>{run.text}</MarkedText>
    case 'unavailable':
      return (
        <Text color="secondary" type="inherit">
          {notes.metricUnavailable}
        </Text>
      )
    case 'code':
      return <Code size="inherit">{run.text}</Code>
    case 'link':
      return (
        <Link href={run.href} hasUnderline>
          <NoteRuns runs={run.children} />
        </Link>
      )
  }
}

function MarkedText({
  marks,
  children,
}: {
  marks: Marks
  children: ReactNode
}) {
  if (marks.length === 0) {
    return children
  }
  return (
    <Text
      type="inherit"
      {...(marks.includes('strong') ? { weight: 'bold' } : {})}
      {...(marks.includes('emphasis') ? { className: 'italic' } : {})}
    >
      {children}
    </Text>
  )
}
