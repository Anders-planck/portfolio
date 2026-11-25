import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Table, type TableColumn } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'

import { SOURCES_MESSAGES } from './sources-messages'
import { type SourceRow, toSourceRowViewFromRow } from './to-source-row-view'

export interface SourcesTableProps {
  rows: SourceRow[]
  onOpenManualCount: (row: SourceRow) => void
}

const { columns } = SOURCES_MESSAGES

function toColumns(
  onOpenManualCount: SourcesTableProps['onOpenManualCount'],
): TableColumn<SourceRow>[] {
  return [
    {
      key: 'value',
      header: columns.value,
      renderCell: (row) => (
        <VStack gap={1}>
          <Text weight="bold">{toSourceRowViewFromRow(row).value}</Text>
          {row.source.kind === 'manual' && (
            <Button
              label={SOURCES_MESSAGES.recordCount}
              aria-label={SOURCES_MESSAGES.recordCountFor(row.label)}
              size="sm"
              variant="ghost"
              onClick={() => {
                onOpenManualCount(row)
              }}
            />
          )}
        </VStack>
      ),
    },
    {
      key: 'label',
      header: columns.label,
      renderCell: (row) => (
        <VStack gap={1}>
          <Text>{row.label}</Text>
          <Text type="code" color="secondary">
            {SOURCES_MESSAGES.reference(row.key)}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'kind',
      header: columns.kind,
      renderCell: (row) => toSourceRowViewFromRow(row).kind,
    },
    {
      key: 'origin',
      header: columns.origin,
      renderCell: (row) => (
        <Text type="code" color="secondary">
          {toSourceRowViewFromRow(row).origin}
        </Text>
      ),
    },
    {
      key: 'cadence',
      header: columns.cadence,
      renderCell: (row) => toSourceRowViewFromRow(row).cadence,
    },
    {
      key: 'status',
      header: columns.status,
      renderCell: (row) => {
        const { status } = toSourceRowViewFromRow(row)
        return (
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StatusDot variant={status.tone} label={status.label} />
              <Text>{status.label}</Text>
            </HStack>
            {status.detail !== null && (
              <Text type="supporting" color="secondary">
                {status.detail}
              </Text>
            )}
          </VStack>
        )
      },
    },
  ]
}

/** Fonti: one row per metric; a manual row can record a new count. */
export function SourcesTable({ rows, onOpenManualCount }: SourcesTableProps) {
  return (
    <Table
      aria-label={SOURCES_MESSAGES.tableLabel}
      data={rows}
      columns={toColumns(onOpenManualCount)}
      idKey="key"
      verticalAlign="top"
      emptyState={<EmptyState title={SOURCES_MESSAGES.empty} isCompact />}
    />
  )
}
