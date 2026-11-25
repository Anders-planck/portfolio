import { Banner } from '@astryxdesign/core/Banner'
import { Text } from '@astryxdesign/core/Text'
import { useQuery } from '@tanstack/react-query'
import { useAction, useMutation } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'
import { SOURCES_MESSAGES } from './sources-messages'
import { SourcesPage } from './sources-page'

const SOURCES_OVERVIEW_QUERY_OPTIONS = convexQueryOptions(
  api.metrics.getSourcesOverview,
  {},
)

/**
 * `/cms/fonti`: the Fonti screen on the owner's Convex functions (ADR 0004,
 * 0005). `SourcesPage` renders what it is given; this reads the overview
 * and hands it the commands.
 */
export function CmsSourcesPage() {
  const overview = useQuery(SOURCES_OVERVIEW_QUERY_OPTIONS)
  const refreshNow = useAction(api.metrics.refreshNow)
  const createMetric = useMutation(api.metrics.createMetric)
  const recordManualCount = useMutation(api.metrics.recordManualCount)
  const chooseLargeNumberStyle = useMutation(api.metrics.chooseLargeNumberStyle)

  if (overview.isError) {
    return <Banner status="error" title={SOURCES_MESSAGES.loadFailed} />
  }
  if (overview.isPending) {
    return (
      <Text type="body" role="status">
        {SOURCES_MESSAGES.loading}
      </Text>
    )
  }
  return (
    <SourcesPage
      overview={overview.data}
      onRefreshNow={async () => {
        await refreshNow({})
      }}
      onCreateMetric={createMetric}
      onRecordManualCount={recordManualCount}
      onChooseLargeNumberStyle={async (largeNumberStyle) => {
        await chooseLargeNumberStyle({ largeNumberStyle })
      }}
    />
  )
}
