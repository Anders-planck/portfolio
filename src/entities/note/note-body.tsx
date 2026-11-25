import { Blockquote } from '@astryxdesign/core/Blockquote'
import { Card } from '@astryxdesign/core/Card'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Heading } from '@astryxdesign/core/Heading'
import { List, ListItem } from '@astryxdesign/core/List'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import type { Locale } from '../../shared/i18n/locale'
import { useMessages } from '../../shared/i18n/use-messages'
import { formatNoteDate } from './format-note-date'
import { NoteFigure } from './note-figure'
import type { NoteBlock, NoteInlineRun } from './note-query-options'
import { NoteRuns } from './note-runs'

type CaseBlock = Extract<NoteBlock, { kind: 'case' }>['blocks'][number]

/**
 * A note body: the blocks the backend rendered, drawn with Astryx text
 * components. Headings and cases carry the anchors the Outline links to.
 */
export function NoteBody({
  blocks,
  locale,
}: {
  blocks: NoteBlock[]
  locale: Locale
}) {
  return (
    <Stack gap={5}>
      {blocks.map((block, position) => (
        // Blocks never move, so their position is a stable key.
        <NoteBlockView key={position} block={block} locale={locale} />
      ))}
    </Stack>
  )
}

function NoteBlockView({
  block,
  locale,
}: {
  block: NoteBlock
  locale: Locale
}) {
  switch (block.kind) {
    case 'heading':
      return (
        <Heading level={block.level} id={block.id} className="scroll-mt-header">
          <NoteRuns runs={block.inlines} />
        </Heading>
      )
    case 'case':
      return (
        <Card id={block.id} padding={6} className="scroll-mt-header">
          <Stack gap={3}>
            <Heading level={2}>
              <NoteRuns runs={block.title} />
            </Heading>
            {block.blocks.map((inner, position) => (
              <SimpleBlockView key={position} block={inner} />
            ))}
          </Stack>
        </Card>
      )
    case 'metric':
      return <MetricBlockView block={block} locale={locale} />
    case 'figure':
      return <NoteFigure image={block.image} caption={block.caption} />
    default:
      return <SimpleBlockView block={block} />
  }
}

function SimpleBlockView({ block }: { block: CaseBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <Paragraph runs={block.inlines} />
    case 'list':
      return (
        <List
          listStyle={block.isOrdered ? 'decimal' : 'disc'}
          density="compact"
        >
          {block.items.map((item, position) => (
            <ListItem key={position} label={<NoteRuns runs={item} />} />
          ))}
        </List>
      )
    case 'quote':
      return (
        <Blockquote>
          <Stack gap={3}>
            {block.paragraphs.map((paragraph, position) => (
              <Paragraph key={position} runs={paragraph} />
            ))}
          </Stack>
        </Blockquote>
      )
    case 'code':
      return (
        <CodeBlock
          code={block.text}
          language="plaintext"
          hasLanguageLabel={false}
          {...(block.language === null ? {} : { title: block.language })}
        />
      )
  }
}

function Paragraph({ runs }: { runs: NoteInlineRun[] }) {
  return (
    <Text as="p" display="block">
      <NoteRuns runs={runs} />
    </Text>
  )
}

function MetricBlockView({
  block,
  locale,
}: {
  block: Extract<NoteBlock, { kind: 'metric' }>
  locale: Locale
}) {
  const { notes } = useMessages()
  return (
    <Card padding={5}>
      <Stack gap={1}>
        <Text type="display-3">
          {block.reading?.text ?? notes.metricUnavailable}
        </Text>
        <Text>
          <NoteRuns runs={block.label} />
        </Text>
        {block.reading !== null && (
          <Text type="supporting" color="secondary">
            {notes.metricVerifiedAt(
              formatNoteDate(block.reading.verifiedAt, locale),
            )}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
