/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'
const modules = import.meta.glob('./**/*.ts')

const read = (backend: ReturnType<typeof convexTest>) =>
  backend.query(api.content.getPublished, {
    collection: 'profile',
    key: 'main',
    locale: 'it',
  })

test('the seed publishes the profile once', async () => {
  const backend = convexTest(schema, modules)
  await backend.mutation(internal.seed.publishSeedProfile, {})
  await backend.mutation(internal.seed.publishSeedProfile, {})

  const profile = await read(backend)
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

  const profile = await read(backend)
  expect(Object.values(profile?.content ?? {}).join(' ')).not.toMatch(/\d/)
})
