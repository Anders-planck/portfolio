import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Link } from '@astryxdesign/core/Link'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Table, type TableColumn } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { Thumbnail } from '@astryxdesign/core/Thumbnail'
import { Token } from '@astryxdesign/core/Token'

import type { MediaEntry } from '../../entities/media/media-library-query-options'
import { CMS_MEDIA_MESSAGES } from '../../shared/i18n/cms-media-messages'
import { type MediaRowView, toMediaRowViewFromEntry } from './to-media-row-view'

const TABLE_COPY = CMS_MEDIA_MESSAGES.table

export interface MediaTableProps {
  entries: MediaEntry[]
  onOpenAlt: (mediaId: MediaEntry['mediaId']) => void
}

/** An entry with its view, built once for all its cells. */
type ViewedEntry = MediaEntry & { view: MediaRowView }

function toColumns(
  onOpenAlt: MediaTableProps['onOpenAlt'],
): TableColumn<ViewedEntry>[] {
  return [
    {
      key: 'preview',
      header: TABLE_COPY.columns.preview,
      renderCell: (entry) =>
        entry.preview === null ? (
          <Token label={TABLE_COPY.pdf} />
        ) : (
          // The file name next to it names the row; the preview adds nothing
          // a screen reader needs (its alt is what this screen edits).
          <Thumbnail src={entry.preview.src} alt="" />
        ),
    },
    {
      key: 'file',
      header: TABLE_COPY.columns.file,
      renderCell: (entry) => (
        <VStack gap={1}>
          {entry.url === null ? (
            <Text weight="bold">{entry.fileName}</Text>
          ) : (
            <Link href={entry.url}>{entry.fileName}</Link>
          )}
          <Text type="supporting" color="secondary">
            {entry.view.details}
          </Text>
          {entry.kind === 'image' && (
            <Text type="code" color="secondary">
              {TABLE_COPY.figureDirective(entry.mediaId)}
            </Text>
          )}
        </VStack>
      ),
    },
    {
      key: 'usage',
      header: TABLE_COPY.columns.usage,
      renderCell: (entry) =>
        entry.view.usages.length === 0 ? (
          <Text color="secondary">{TABLE_COPY.unused}</Text>
        ) : (
          <VStack gap={1}>
            {entry.view.usages.map((usage) => (
              <Text key={usage}>{usage}</Text>
            ))}
          </VStack>
        ),
    },
    {
      key: 'alt',
      header: TABLE_COPY.columns.alt,
      renderCell: (entry) => {
        const { altStatus } = entry.view
        return (
          <VStack gap={1}>
            <HStack gap={2} align="center">
              <StatusDot variant={altStatus.tone} label={altStatus.label} />
              <Text>{altStatus.label}</Text>
            </HStack>
            {entry.kind === 'image' && (
              <Button
                label={TABLE_COPY.editAlt}
                aria-label={TABLE_COPY.editAltFor(entry.fileName)}
                size="sm"
                variant="ghost"
                onClick={() => {
                  onOpenAlt(entry.mediaId)
                }}
              />
            )}
          </VStack>
        )
      },
    },
  ]
}

/** CMS Media: one row per upload, newest first (dense data as rows). */
export function MediaTable({ entries, onOpenAlt }: MediaTableProps) {
  return (
    <Table
      aria-label={TABLE_COPY.label}
      data={entries.map((entry) => ({
        ...entry,
        view: toMediaRowViewFromEntry(entry),
      }))}
      columns={toColumns(onOpenAlt)}
      idKey="mediaId"
      verticalAlign="top"
      // Level 2: the table sits right under the page's h1 (axe heading-order).
      emptyState={
        <EmptyState title={TABLE_COPY.empty} headingLevel={2} isCompact />
      }
    />
  )
}
