/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api, internal } from './_generated/api'
import { createOwnerBackend } from './owner.fixture'
import schema from './schema'
const modules = import.meta.glob('./**/*.ts')

const readPublishedProfile = (backend: ReturnType<typeof convexTest>) =>
  backend.query(api.content.getPublished, {
    collection: 'profile',
    key: 'main',
    locale: 'it',
  })

test('the seed publishes the profile once', async () => {
  const backend = convexTest(schema, modules)
  await backend.mutation(internal.seed.publishSeedProfile, {})
  await backend.mutation(internal.seed.publishSeedProfile, {})

  const profile = await readPublishedProfile(backend)
  expect(profile?.fields.name).toBe('Anders Planck')
  expect(profile?.content).toMatchObject({
    titleLine1: 'Software',
    titleLine2: 'Engineer.',
  })
  const releases = await backend.run((ctx) => ctx.db.query('releases').take(10))
  expect(releases).toHaveLength(1)
})

test('the seeded copy has no free numbers (ADR 0004)', async () => {
  const backend = convexTest(schema, modules)
  await backend.mutation(internal.seed.publishSeedProfile, {})

  const profile = await readPublishedProfile(backend)
  expect(Object.values(profile?.content ?? {}).join(' ')).not.toMatch(/\d/)
})

test('the seed creates the cms-fonti metrics once, with the manual count', async () => {
  const backend = await createOwnerBackend()
  await backend.mutation(internal.seed.seedMetrics, {})
  await backend.mutation(internal.seed.seedMetrics, {})

  const overview = await backend.query(api.metrics.getSourcesOverview, {})
  expect(overview.metrics.map((metric) => metric.key)).toEqual([
    'sdk-downloads',
    'expo-mtls-downloads',
    'sdk-commits',
    'expo-mtls-commits',
    'leco-test-files',
  ])
  expect(
    overview.metrics.find((metric) => metric.key === 'leco-test-files'),
  ).toMatchObject({
    display: '750+',
    verifiedAt: Date.UTC(2026, 10, 23),
    evidence: 'Conteggio a mano',
  })
  const readings = await backend.run((ctx) =>
    ctx.db.query('metricReadings').take(10),
  )
  expect(readings).toHaveLength(1)
})
