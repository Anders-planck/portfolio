/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'
const modules = import.meta.glob('./**/*.ts')
import { type Finding, PUBLISH_RULES, type Rule } from './model/content/rules'

const profile = { collection: 'profile', key: 'main' } as const

function setup() {
  return convexTest(schema, modules)
}

test('nothing is public before the first publish', async () => {
  const backend = setup()
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    fields: { name: 'Anders Planck' },
  })

  expect(
    await backend.query(api.content.getPublished, { ...profile, locale: 'it' }),
  ).toBeNull()
})

test('publishing makes the draft public for its locale', async () => {
  const backend = setup()
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    fields: { name: 'Anders Planck' },
    locale: 'it',
    content: { titleLine1: 'Software', titleLine2: 'Engineer.' },
  })

  await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: 'Prima pubblicazione',
  })

  const published = await backend.query(api.content.getPublished, {
    ...profile,
    locale: 'it',
  })
  expect(published?.fields.name).toBe('Anders Planck')
  expect(published?.content).toMatchObject({
    titleLine1: 'Software',
    titleLine2: 'Engineer.',
  })
})

test('later draft edits stay private until the next publish', async () => {
  const backend = setup()
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Prima' },
  })
  await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: 'v1',
  })

  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Seconda' },
  })
  const read = () =>
    backend.query(api.content.getPublished, { ...profile, locale: 'it' })
  expect((await read())?.content?.subtitle).toBe('Prima')

  await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: 'v2',
  })
  expect((await read())?.content?.subtitle).toBe('Seconda')
})

test('each locale reads its own content; a missing locale has none', async () => {
  const backend = setup()
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'it',
    content: { statusLabel: 'Disponibile' },
  })
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'en',
    content: { statusLabel: 'Available' },
  })
  await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: 'Lingue',
  })

  const read = (locale: 'it' | 'en' | 'fr') =>
    backend.query(api.content.getPublished, { ...profile, locale })
  expect((await read('it'))?.content?.statusLabel).toBe('Disponibile')
  expect((await read('en'))?.content?.statusLabel).toBe('Available')
  expect((await read('fr'))?.content).toBeNull()
})

test('publishing a document without a draft fails', async () => {
  const backend = setup()
  await expect(
    backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Vuoto',
    }),
  ).rejects.toThrow(/No draft/)
})

async function publishSubtitle(
  backend: ReturnType<typeof setup>,
  subtitle: string,
) {
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle },
  })
  const result = await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: subtitle,
  })
  if (result.status !== 'published') throw new Error(result.status)
  return result.releaseId
}

const publishedSubtitle = async (backend: ReturnType<typeof setup>) =>
  (await backend.query(api.content.getPublished, { ...profile, locale: 'it' }))
    ?.content?.subtitle

test('rollback restores any earlier release and leaves the draft alone', async () => {
  const backend = setup()
  const first = await publishSubtitle(backend, 'Uno')
  const second = await publishSubtitle(backend, 'Due')
  await publishSubtitle(backend, 'Tre')
  await backend.mutation(internal.content.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Bozza' },
  })

  await backend.mutation(internal.content.rollback, { releaseId: first })
  expect(await publishedSubtitle(backend)).toBe('Uno')

  await backend.mutation(internal.content.rollback, { releaseId: second })
  expect(await publishedSubtitle(backend)).toBe('Due')

  // The draft is the owner's work in progress; rollback never touches it.
  await backend.mutation(internal.content.publish, {
    selection: [profile],
    note: 'Dopo il rollback',
  })
  expect(await publishedSubtitle(backend)).toBe('Bozza')
})

test('rollback is itself a release that can be rolled back', async () => {
  const backend = setup()
  const first = await publishSubtitle(backend, 'Uno')
  await publishSubtitle(backend, 'Due')

  const { releaseId: rollbackId } = await backend.mutation(
    internal.content.rollback,
    { releaseId: first },
  )
  await publishSubtitle(backend, 'Tre')
  await backend.mutation(internal.content.rollback, { releaseId: rollbackId })

  expect(await publishedSubtitle(backend)).toBe('Uno')
})

describe('scheduled publish', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('goes live at its time with the drafts as they were when scheduled', async () => {
    const backend = setup()
    await publishSubtitle(backend, 'Adesso')
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Domani' },
    })

    const at = Date.now() + 24 * 60 * 60 * 1000
    const result = await backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Programmata',
      at,
    })
    expect(result.status).toBe('scheduled')

    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Ancora in bozza' },
    })
    expect(await publishedSubtitle(backend)).toBe('Adesso')

    vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    await backend.finishInProgressScheduledFunctions()
    expect(await publishedSubtitle(backend)).toBe('Domani')
  })

  test('a time in the past publishes now', async () => {
    const backend = setup()
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Subito' },
    })
    const result = await backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Passato',
      at: Date.now() - 1000,
    })
    expect(result.status).toBe('published')
    expect(await publishedSubtitle(backend)).toBe('Subito')
  })
})

describe('rules at publish', () => {
  // A stand-in rule: placeholders `[...]` block, the word "TODO" warns.
  const placeholderRule: Rule = (snapshot) =>
    snapshot.content.flatMap((record) => {
      const findings: Finding[] = []
      if (/\[.*\]/.test(record.subtitle)) {
        findings.push({
          rule: 'placeholder',
          severity: 'block',
          field: 'subtitle',
          locale: record.locale,
          message: 'Placeholder left in the copy',
        })
      }
      if (record.subtitle.includes('TODO')) {
        findings.push({
          rule: 'todo',
          severity: 'warn',
          field: 'subtitle',
          locale: record.locale,
          message: 'TODO left in the copy',
        })
      }
      return findings
    })

  beforeEach(() => {
    PUBLISH_RULES.push(placeholderRule)
  })
  afterEach(() => {
    PUBLISH_RULES.length = 0
    vi.useRealTimers()
  })

  test('a block finding aborts the publish and nothing goes live', async () => {
    const backend = setup()
    await publishSubtitle(backend, 'Buona')
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'en',
      content: { subtitle: '[da scrivere]' },
    })

    const result = await backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Bloccata',
    })

    expect(result).toEqual({
      status: 'blocked',
      findings: [
        {
          collection: 'profile',
          key: 'main',
          rule: 'placeholder',
          severity: 'block',
          field: 'subtitle',
          locale: 'en',
          message: 'Placeholder left in the copy',
        },
      ],
    })
    expect(await publishedSubtitle(backend)).toBe('Buona')
  })

  test('warn findings publish and come back with the release', async () => {
    const backend = setup()
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Quasi TODO' },
    })

    const result = await backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Con avvisi',
    })

    expect(result.status).toBe('published')
    expect(result.findings.map((finding) => finding.rule)).toEqual(['todo'])
    expect(await publishedSubtitle(backend)).toBe('Quasi TODO')
  })

  test('a scheduled release fails if a rule blocks it when it comes due', async () => {
    vi.useFakeTimers()
    const backend = setup()
    await publishSubtitle(backend, 'Prima')
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Dopo [anno]' },
    })
    // Scheduled while the rule set is still empty...
    PUBLISH_RULES.length = 0
    await backend.mutation(internal.content.publish, {
      selection: [profile],
      note: 'Programmata',
      at: Date.now() + 60_000,
    })
    // ...then the rules are tightened before it runs.
    PUBLISH_RULES.push(placeholderRule)

    vi.advanceTimersByTime(60_000)
    await backend.finishInProgressScheduledFunctions()
    expect(await publishedSubtitle(backend)).toBe('Prima')
  })
})

describe('preview', () => {
  beforeEach(() => {
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'test-preview-secret')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  async function previewOfDraft(backend: ReturnType<typeof setup>) {
    await publishSubtitle(backend, 'Pubblicata')
    await backend.mutation(internal.content.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'In bozza' },
    })
    const { token } = await backend.mutation(
      internal.content.createPreviewToken,
      { ...profile, locale: 'it' },
    )
    return token
  }

  test('a preview token reads the draft while the public reads the release', async () => {
    const backend = setup()
    const token = await previewOfDraft(backend)

    const draft = await backend.query(api.content.getDraft, { token })
    expect(draft?.content?.subtitle).toBe('In bozza')
    expect(await publishedSubtitle(backend)).toBe('Pubblicata')
  })

  test('a preview token expires', async () => {
    vi.useFakeTimers()
    const backend = setup()
    const token = await previewOfDraft(backend)

    vi.advanceTimersByTime(60 * 60 * 1000 + 1)
    expect(await backend.query(api.content.getDraft, { token })).toBeNull()
  })

  test('a token that is not genuine reads nothing', async () => {
    const backend = setup()
    const token = await previewOfDraft(backend)

    expect(
      await backend.query(api.content.getDraft, { token: 'not-a-token' }),
    ).toBeNull()
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'another-secret')
    expect(await backend.query(api.content.getDraft, { token })).toBeNull()
  })
})
