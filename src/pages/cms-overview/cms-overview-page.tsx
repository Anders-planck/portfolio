import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'

import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const { overview } = CMS_MESSAGES

/**
 * Panoramica, empty for now: last release, drafts, AI proposals, violations,
 * source health and AI spend (resolution 15) come with the tickets that make
 * them.
 */
export function CmsOverviewPage() {
  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>{overview.title}</Heading>
        <Text type="body" as="p">
          {overview.description}
        </Text>
      </VStack>
      <EmptyState
        title={overview.emptyTitle}
        description={overview.emptyDescription}
        headingLevel={2}
      />
    </VStack>
  )
}
