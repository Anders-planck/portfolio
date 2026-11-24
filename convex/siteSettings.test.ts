/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import { type Appearance, defaultAppearance } from './lib/appearance'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function getAppearance(t: ReturnType<typeof convexTest>) {
  return (await t.query(api.siteSettings.getAppearance, {})).appearance
}

const published: Appearance = {
  theme: {
    base: 18,
    ratio: 1.333,
    fonts: { body: 'Inter', heading: 'Fraunces', code: 'JetBrains Mono' },
    radiusMultiplier: 0.5,
    mode: 'dark',
  },
  motion: { tempo: 1.2, character: 'crisp' },
}

test('getAppearance returns the defaults before anything is published', async () => {
  const t = convexTest(schema, modules)
  expect(await getAppearance(t)).toEqual(defaultAppearance)
})

test('setAppearance publishes params that getAppearance returns', async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.siteSettings.setAppearance, published)
  expect(await getAppearance(t)).toEqual(published)

  const changed = {
    ...published,
    motion: { tempo: 0.8, character: 'expressive' as const },
  }
  await t.mutation(internal.siteSettings.setAppearance, changed)
  expect(await getAppearance(t)).toEqual(changed)
})

test('getAppearance returns the CSS the params make', async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.siteSettings.setAppearance, published)
  const { css } = await t.query(api.siteSettings.getAppearance, {})
  expect(css).toContain('@scope ([data-astryx-theme="portfolio"])')
  expect(css).toContain('--font-family-heading: Fraunces, ')
  expect(css).toContain('--_astryx-motion-tempo: 1.2;')
})

test('resetAppearance falls back to the defaults', async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.siteSettings.setAppearance, published)
  await t.mutation(internal.siteSettings.resetAppearance, {})
  expect(await getAppearance(t)).toEqual(defaultAppearance)
})

test('setAppearance rejects params out of range or unsafe font names', async () => {
  const t = convexTest(schema, modules)
  await expect(
    t.mutation(internal.siteSettings.setAppearance, {
      ...published,
      theme: { ...published.theme, base: 4 },
    }),
  ).rejects.toThrow(/theme.base must be between 12 and 24/)
  await expect(
    t.mutation(internal.siteSettings.setAppearance, {
      ...published,
      theme: {
        ...published.theme,
        fonts: {
          ...published.theme.fonts,
          body: 'Inter; } body { display: none',
        },
      },
    }),
  ).rejects.toThrow(/theme.fonts.body is not a font family name/)
  expect(await getAppearance(t)).toEqual(defaultAppearance)
})
