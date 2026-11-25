import { expect, test } from 'vitest'

import { type RenderableMetric, renderMetricReferences } from './render'

const VERIFIED_AT = Date.UTC(2026, 10, 23)

const METRICS = new Map<string, RenderableMetric>([
  [
    'sdk-downloads',
    {
      format: 'count',
      reading: {
        figure: { value: 8489, total: null },
        verifiedAt: VERIFIED_AT,
      },
    },
  ],
  ['leco-commits', { format: 'count', reading: null }],
])

test('a reference renders as the last verified figure with its date', () => {
  expect(
    renderMetricReferences(
      '{{m:sdk-downloads}} download/anno',
      METRICS,
      'en',
      'exact',
    ),
  ).toEqual([
    {
      kind: 'metric',
      key: 'sdk-downloads',
      text: '8,489',
      verifiedAt: VERIFIED_AT,
    },
    { kind: 'text', text: ' download/anno' },
  ])
})

test('a metric without a verified reading is unavailable, never zero', () => {
  expect(
    renderMetricReferences('{{m:leco-commits}} commit', METRICS, 'it', 'exact'),
  ).toEqual([
    { kind: 'unavailable', key: 'leco-commits' },
    { kind: 'text', text: ' commit' },
  ])
})

test('a reference to an unknown metric is unavailable', () => {
  expect(
    renderMetricReferences('{{m:missing}}', METRICS, 'it', 'exact'),
  ).toEqual([{ kind: 'unavailable', key: 'missing' }])
})

test('the rounding choice applies when rendering', () => {
  const large = new Map<string, RenderableMetric>([
    [
      'downloads',
      {
        format: 'count',
        reading: {
          figure: { value: 25_300, total: null },
          verifiedAt: VERIFIED_AT,
        },
      },
    ],
  ])

  expect(
    renderMetricReferences('{{m:downloads}}', large, 'it', 'compact'),
  ).toEqual([
    { kind: 'metric', key: 'downloads', text: '25k+', verifiedAt: VERIFIED_AT },
  ])
})
