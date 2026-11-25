import { expect, test } from 'vitest'

import {
  EMPTY_NEW_SOURCE_FORM,
  toMetricDefinitionFromForm,
} from './to-metric-definition-from-form'

test('a commit source takes its repositories, author and total choice', () => {
  expect(
    toMetricDefinitionFromForm({
      ...EMPTY_NEW_SOURCE_FORM,
      key: ' leco-commits ',
      label: 'commit miei in LECO',
      kind: 'github-commits',
      packageName: 'ignored-package',
      repos: 'owner/api, owner/web,  ',
      login: 'Anders-planck',
      needsToken: true,
      showsTotal: true,
      cadence: 'weekly',
    }),
  ).toEqual({
    key: 'leco-commits',
    label: 'commit miei in LECO',
    format: 'count-of-total',
    source: {
      kind: 'github-commits',
      repos: ['owner/api', 'owner/web'],
      login: 'Anders-planck',
      needsToken: true,
      cadence: 'weekly',
    },
  })
})

test('a manual source can be a lower bound and has no cadence', () => {
  expect(
    toMetricDefinitionFromForm({
      ...EMPTY_NEW_SOURCE_FORM,
      key: 'test-files',
      label: 'file di test',
      kind: 'manual',
      isLowerBound: true,
      showsTotal: true,
    }),
  ).toEqual({
    key: 'test-files',
    label: 'file di test',
    format: 'at-least',
    source: { kind: 'manual' },
  })
})

test('npm and search sources count', () => {
  expect(
    toMetricDefinitionFromForm({
      ...EMPTY_NEW_SOURCE_FORM,
      key: 'downloads',
      label: 'download',
      packageName: ' @scope/pkg ',
    }).source,
  ).toEqual({ kind: 'npm', packageName: '@scope/pkg', cadence: 'daily' })
  expect(
    toMetricDefinitionFromForm({
      ...EMPTY_NEW_SOURCE_FORM,
      kind: 'github-search',
      query: 'is:pr is:merged',
      needsToken: true,
    }),
  ).toMatchObject({
    format: 'count',
    source: {
      kind: 'github-search',
      query: 'is:pr is:merged',
      needsToken: true,
    },
  })
})
