import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const OVERVIEW_COPY = CMS_MESSAGES.overview

/**
 * Panoramica, empty for now: last release, drafts, AI proposals, violations,
 * source health and AI spend (resolution 15) come with the tickets that make
 * them.
 */
export function CmsOverviewPage() {
  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>{OVERVIEW_COPY.title}</Heading>
        <Text type="body" as="p">
          {OVERVIEW_COPY.description}
        </Text>
      </VStack>
      <EmptyState
        title={OVERVIEW_COPY.emptyTitle}
        description={OVERVIEW_COPY.emptyDescription}
        headingLevel={2}
      />
    </VStack>
  )
}
