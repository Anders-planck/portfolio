/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { api, internal } from './_generated/api'
import { type Appearance, DEFAULT_APPEARANCE } from './model/appearance'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const DARK_APPEARANCE: Appearance = {
  theme: {
    basePx: 18,
    ratio: 1.333,
    fonts: { body: 'Inter', heading: 'Fraunces', code: 'JetBrains Mono' },
    radiusMultiplier: 0.5,
    mode: 'dark',
  },
  motion: { tempo: 1.2, character: 'crisp' },
}

function createBackend() {
  return convexTest(schema, modules)
}

async function readPublished(backend: ReturnType<typeof createBackend>) {
  return backend.query(api.appearance.getPublished, {})
}

test('the defaults are published before anything else', async () => {
  const backend = createBackend()
  expect(await readPublished(backend)).toEqual(DEFAULT_APPEARANCE)
})

test('a publish replaces the published params', async () => {
  const backend = createBackend()
  expect(
    await backend.mutation(internal.appearance.publish, DARK_APPEARANCE),
  ).toEqual({ kind: 'published' })
  expect(await readPublished(backend)).toEqual(DARK_APPEARANCE)
  expect(
    await backend.query(internal.appearance.findStoredProblems, {}),
  ).toEqual([])

  const quicker: Appearance = {
    ...DARK_APPEARANCE,
    motion: { tempo: 0.8, character: 'expressive' },
  }
  await backend.mutation(internal.appearance.publish, quicker)
  expect(await readPublished(backend)).toEqual(quicker)
})

test('unpublishing brings the defaults back', async () => {
  const backend = createBackend()
  await backend.mutation(internal.appearance.publish, DARK_APPEARANCE)
  await backend.mutation(internal.appearance.unpublish, {})
  expect(await readPublished(backend)).toEqual(DEFAULT_APPEARANCE)
})

test('a number out of range is not published', async () => {
  const backend = createBackend()
  expect(
    await backend.mutation(internal.appearance.publish, {
      ...DARK_APPEARANCE,
      theme: { ...DARK_APPEARANCE.theme, basePx: 4 },
    }),
  ).toEqual({
    kind: 'rejected',
    problems: [
      { kind: 'out-of-range', field: 'theme.basePx', min: 12, max: 24 },
    ],
  })
  expect(await readPublished(backend)).toEqual(DEFAULT_APPEARANCE)
})

test('a font name that could break out of CSS is not published', async () => {
  const backend = createBackend()
  expect(
    await backend.mutation(internal.appearance.publish, {
      ...DARK_APPEARANCE,
      theme: {
        ...DARK_APPEARANCE.theme,
        fonts: {
          ...DARK_APPEARANCE.theme.fonts,
          body: 'Inter; } body { display: none',
        },
      },
    }),
  ).toEqual({
    kind: 'rejected',
    problems: [{ kind: 'not-a-font-name', field: 'theme.fonts.body' }],
  })
  expect(await readPublished(backend)).toEqual(DEFAULT_APPEARANCE)
})

test('a malicious font name written straight to the table is never served', async () => {
  const backend = createBackend()
  await backend.run(async (ctx) => {
    await ctx.db.insert('appearance', {
      ...DARK_APPEARANCE,
      theme: {
        ...DARK_APPEARANCE.theme,
        fonts: {
          ...DARK_APPEARANCE.theme.fonts,
          heading: 'x</style><script>alert(1)</script>',
        },
      },
    })
  })
  expect(await readPublished(backend)).toEqual(DEFAULT_APPEARANCE)
  expect(
    await backend.query(internal.appearance.findStoredProblems, {}),
  ).toEqual([{ kind: 'not-a-font-name', field: 'theme.fonts.heading' }])
})
