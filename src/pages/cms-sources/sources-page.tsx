import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import {
  HStack,
  Layout,
  LayoutContent,
  VStack,
} from '@astryxdesign/core/Layout'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useState } from 'react'

import {
  ManualCountDialog,
  type ManualCountDialogProps,
} from './manual-count-dialog'
import { NewSourceDialog, type NewSourceDialogProps } from './new-source-dialog'
import { SOURCES_MESSAGES } from './sources-messages'
import { SourcesSettings, type SourcesSettingsProps } from './sources-settings'
import { SourcesTable } from './sources-table'
import type { SourceRow, SourcesOverview } from './to-source-row-view'

export interface SourcesPageProps {
  overview: SourcesOverview
  onRefreshNow: () => Promise<void>
  onCreateMetric: NewSourceDialogProps['onCreateMetric']
  onRecordManualCount: ManualCountDialogProps['onRecordManualCount']
  onChooseLargeNumberStyle: SourcesSettingsProps['onChooseLargeNumberStyle']
}

/**
 * CMS Fonti (mockup `cms-fonti`): every metric with its source and status,
 * "Aggiorna ora", "Nuova fonte", manual counts and how figures are rounded.
 * It renders data it is given; `cms-sources-page.tsx` wires the Convex
 * functions.
 */
export function SourcesPage({
  overview,
  onRefreshNow,
  onCreateMetric,
  onRecordManualCount,
  onChooseLargeNumberStyle,
}: SourcesPageProps) {
  const [manualRow, setManualRow] = useState<SourceRow | null>(null)
  const [isNewSourceOpen, setIsNewSourceOpen] = useState(false)
  const [hasRefreshFailed, setHasRefreshFailed] = useState(false)

  const refreshNow = async () => {
    setHasRefreshFailed(false)
    await onRefreshNow().catch(() => {
      setHasRefreshFailed(true)
    })
  }

  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
              <VStack gap={1}>
                <Heading level={1}>{SOURCES_MESSAGES.title}</Heading>
                <Text color="secondary">{SOURCES_MESSAGES.intro}</Text>
              </VStack>
              <HStack gap={2}>
                <Button
                  label={SOURCES_MESSAGES.refreshNow}
                  clickAction={refreshNow}
                />
                <Button
                  label={SOURCES_MESSAGES.newSource}
                  variant="primary"
                  onClick={() => {
                    setIsNewSourceOpen(true)
                  }}
                />
              </HStack>
            </HStack>
            {hasRefreshFailed && (
              <Banner status="error" title={SOURCES_MESSAGES.refreshFailed} />
            )}
            <SourcesTable
              rows={overview.metrics}
              onOpenManualCount={setManualRow}
            />
            <SourcesSettings
              isGithubTokenSet={overview.isGithubTokenSet}
              largeNumberStyle={overview.largeNumberStyle}
              onChooseLargeNumberStyle={onChooseLargeNumberStyle}
            />
          </VStack>
          {manualRow !== null && (
            <ManualCountDialog
              metricKey={manualRow.key}
              metricLabel={manualRow.label}
              onClose={() => {
                setManualRow(null)
              }}
              onRecordManualCount={onRecordManualCount}
            />
          )}
          {isNewSourceOpen && (
            <NewSourceDialog
              onClose={() => {
                setIsNewSourceOpen(false)
              }}
              onCreateMetric={onCreateMetric}
            />
          )}
        </LayoutContent>
      }
    />
  )
}
