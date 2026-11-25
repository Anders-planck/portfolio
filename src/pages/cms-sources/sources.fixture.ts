import type { SourcesOverview } from './to-source-row-view'

/** Fonti as the overview query returns it: an npm, a GitHub and a manual metric. */
export const SOURCES_OVERVIEW: SourcesOverview = {
  metrics: [
    {
      key: 'sdk-downloads',
      label: 'download/anno SDK e-receipts',
      format: 'count',
      source: {
        kind: 'npm',
        packageName: '@a-cube-io/ereceipts-js-sdk',
        cadence: 'daily',
      },
      display: '8.489',
      verifiedAt: Date.UTC(2026, 10, 25, 4),
      evidence: null,
      status: { kind: 'ok' },
    },
    {
      key: 'expo-mtls-commits',
      label: 'commit miei in expo-mutual-tls',
      format: 'count-of-total',
      source: {
        kind: 'github-commits',
        repos: ['a-cube-io/expo-mutual-tls'],
        login: 'Anders-planck',
        needsToken: false,
        cadence: 'daily',
      },
      display: null,
      verifiedAt: null,
      evidence: null,
      status: { kind: 'awaiting-reading' },
    },
    {
      key: 'leco-test-files',
      label: 'file di test in LECO',
      format: 'at-least',
      source: { kind: 'manual' },
      display: '750+',
      verifiedAt: Date.UTC(2026, 10, 23),
      evidence: 'Conteggio a mano',
      status: { kind: 'ok' },
    },
  ],
  largeNumberStyle: 'compact',
  isGithubTokenSet: true,
}
