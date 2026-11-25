import { expect, test } from 'vitest'

import { findDefinitionProblems, findManualCountProblems } from './checks'

const NOW = Date.UTC(2026, 10, 25)

test('a well-formed definition has no problems', () => {
  expect(
    findDefinitionProblems({
      key: 'sdk-commits',
      label: 'commit miei nell’SDK',
      format: 'count-of-total',
      source: {
        kind: 'github-commits',
        repos: ['a-cube-io/ereceipts-js-sdk'],
        login: 'Anders-planck',
        needsToken: false,
        cadence: 'daily',
      },
    }),
  ).toEqual([])
})

test('the key, label and source fields are checked', () => {
  expect(
    findDefinitionProblems({
      key: 'Not a key',
      label: '  ',
      format: 'count',
      source: {
        kind: 'github-commits',
        repos: ['no-slash', '../escape/repo'],
        login: ' ',
        needsToken: true,
        cadence: 'weekly',
      },
    }),
  ).toEqual([
    { kind: 'invalid-key' },
    { kind: 'empty-label' },
    { kind: 'invalid-repo', repo: 'no-slash' },
    { kind: 'invalid-repo', repo: '../escape/repo' },
    { kind: 'invalid-login' },
  ])
})

test('an npm source needs a valid package name and a search a query', () => {
  expect(
    findDefinitionProblems({
      key: 'downloads',
      label: 'download',
      format: 'count',
      source: { kind: 'npm', packageName: '../admin', cadence: 'daily' },
    }),
  ).toEqual([{ kind: 'invalid-package' }])
  expect(
    findDefinitionProblems({
      key: 'merged-prs',
      label: 'PR',
      format: 'count',
      source: {
        kind: 'github-search',
        query: '',
        needsToken: true,
        cadence: 'daily',
      },
    }),
  ).toEqual([{ kind: 'empty-query' }])
})

test('a commit source needs at least one repository', () => {
  expect(
    findDefinitionProblems({
      key: 'commits',
      label: 'commit',
      format: 'count',
      source: {
        kind: 'github-commits',
        repos: [],
        login: 'Anders-planck',
        needsToken: false,
        cadence: 'daily',
      },
    }),
  ).toEqual([{ kind: 'no-repos' }])
})

test('only commit sources have a total to show', () => {
  expect(
    findDefinitionProblems({
      key: 'test-files',
      label: 'file di test',
      format: 'count-of-total',
      source: { kind: 'manual' },
    }),
  ).toEqual([{ kind: 'format-needs-total' }])
})

test('a manual count needs evidence, a whole number and a day not in the future', () => {
  expect(
    findManualCountProblems(
      { value: 750, countedAt: NOW, evidence: 'Conteggio a mano' },
      NOW,
    ),
  ).toEqual([])
  expect(
    findManualCountProblems(
      { value: 7.5, countedAt: NOW + 1, evidence: '  ' },
      NOW,
    ),
  ).toEqual([
    { kind: 'invalid-value' },
    { kind: 'counted-in-future' },
    { kind: 'missing-evidence' },
  ])
  expect(
    findManualCountProblems(
      { value: Number.POSITIVE_INFINITY, countedAt: NOW, evidence: 'x' },
      NOW,
    ),
  ).toEqual([{ kind: 'invalid-value' }])
})
