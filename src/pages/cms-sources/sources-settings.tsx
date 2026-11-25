import { Banner } from '@astryxdesign/core/Banner'
import { Card } from '@astryxdesign/core/Card'
import { Grid } from '@astryxdesign/core/Grid'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Selector } from '@astryxdesign/core/Selector'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Heading, Text } from '@astryxdesign/core/Text'
import { useState } from 'react'

import { SOURCES_MESSAGES } from './sources-messages'
import type { SourcesOverview } from './to-source-row-view'

type LargeNumberStyle = SourcesOverview['largeNumberStyle']

export interface SourcesSettingsProps {
  isGithubTokenSet: boolean
  largeNumberStyle: LargeNumberStyle
  onChooseLargeNumberStyle: (style: LargeNumberStyle) => Promise<void>
}

const { token, rounding, whenSourceFails } = SOURCES_MESSAGES

const ROUNDING_OPTIONS = (['compact', 'exact'] as const).map((style) => ({
  value: style,
  label: rounding[style],
}))

function isLargeNumberStyle(value: string | null): value is LargeNumberStyle {
  return ROUNDING_OPTIONS.some((option) => option.value === value)
}

/**
 * Fonti, under the table: whether the GitHub token is set (never the token),
 * the rounding choice, and what the site does when a source fails.
 */
export function SourcesSettings({
  isGithubTokenSet,
  largeNumberStyle,
  onChooseLargeNumberStyle,
}: SourcesSettingsProps) {
  const [hasSaveFailed, setHasSaveFailed] = useState(false)
  const tokenStatus = isGithubTokenSet ? token.set : token.missing

  const chooseRounding = async (style: string | null) => {
    if (!isLargeNumberStyle(style)) {
      return
    }
    setHasSaveFailed(false)
    await onChooseLargeNumberStyle(style).catch(() => {
      setHasSaveFailed(true)
    })
  }

  return (
    <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
      <Card>
        <VStack gap={2}>
          <Heading level={2}>{token.title}</Heading>
          <Text color="secondary">{token.body}</Text>
          <HStack gap={2} vAlign="center">
            <StatusDot
              variant={isGithubTokenSet ? 'success' : 'warning'}
              label={tokenStatus}
            />
            <Text>{tokenStatus}</Text>
          </HStack>
        </VStack>
      </Card>
      <Card>
        <VStack gap={2}>
          <Heading level={2}>{rounding.title}</Heading>
          <Selector
            label={rounding.label}
            options={ROUNDING_OPTIONS}
            value={largeNumberStyle}
            changeAction={chooseRounding}
          />
          {hasSaveFailed && (
            <Banner status="error" title={rounding.saveFailed} />
          )}
          <Text type="supporting" color="secondary">
            {rounding.separator}
          </Text>
        </VStack>
      </Card>
      <Card>
        <VStack gap={2}>
          <Heading level={2}>{whenSourceFails.title}</Heading>
          <Text color="secondary">{whenSourceFails.body}</Text>
        </VStack>
      </Card>
    </Grid>
  )
}
