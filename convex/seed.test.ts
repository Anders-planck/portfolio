import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'
import { modules } from './test.setup'

const read = (t: ReturnType<typeof convexTest>) =>
  t.query(api.content.store.getPublished, {
    collection: 'profile',
    key: 'main',
    locale: 'it',
  })

test('the seed publishes the profile once', async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.seed.profile, {})
  await t.mutation(internal.seed.profile, {})

  const profile = await read(t)
  expect(profile?.fields.name).toBe('Anders Planck')
  expect(profile?.content).toMatchObject({
    titleLine1: 'Software',
    titleLine2: 'Engineer.',
  })
  const releases = await t.run((ctx) => ctx.db.query('releases').take(10))
  expect(releases).toHaveLength(1)
})

test('the seeded copy has no free numbers (ADR 0004)', async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.seed.profile, {})

  const profile = await read(t)
  expect(Object.values(profile?.content ?? {}).join(' ')).not.toMatch(/\d/)
})
