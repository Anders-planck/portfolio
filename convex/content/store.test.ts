import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { api, internal } from '../_generated/api'
import schema from '../schema'
import { modules } from '../test.setup'
import { type Finding, publishRules, type Rule } from './rules'

const profile = { collection: 'profile', key: 'main' } as const

function setup() {
  return convexTest(schema, modules)
}

test('nothing is public before the first publish', async () => {
  const t = setup()
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    fields: { name: 'Anders Planck' },
  })

  expect(
    await t.query(api.content.store.getPublished, { ...profile, locale: 'it' }),
  ).toBeNull()
})

test('publishing makes the draft public for its locale', async () => {
  const t = setup()
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    fields: { name: 'Anders Planck' },
    locale: 'it',
    content: { titleLine1: 'Software', titleLine2: 'Engineer.' },
  })

  await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: 'Prima pubblicazione',
  })

  const published = await t.query(api.content.store.getPublished, {
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
  const t = setup()
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Prima' },
  })
  await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: 'v1',
  })

  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Seconda' },
  })
  const read = () =>
    t.query(api.content.store.getPublished, { ...profile, locale: 'it' })
  expect((await read())?.content?.subtitle).toBe('Prima')

  await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: 'v2',
  })
  expect((await read())?.content?.subtitle).toBe('Seconda')
})

test('each locale reads its own content; a missing locale has none', async () => {
  const t = setup()
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'it',
    content: { statusLabel: 'Disponibile' },
  })
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'en',
    content: { statusLabel: 'Available' },
  })
  await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: 'Lingue',
  })

  const read = (locale: 'it' | 'en' | 'fr') =>
    t.query(api.content.store.getPublished, { ...profile, locale })
  expect((await read('it'))?.content?.statusLabel).toBe('Disponibile')
  expect((await read('en'))?.content?.statusLabel).toBe('Available')
  expect((await read('fr'))?.content).toBeNull()
})

test('publishing a document without a draft fails', async () => {
  const t = setup()
  await expect(
    t.mutation(internal.content.store.publish, {
      selection: [profile],
      note: 'Vuoto',
    }),
  ).rejects.toThrow(/No draft/)
})

async function publishSubtitle(t: ReturnType<typeof setup>, subtitle: string) {
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle },
  })
  const result = await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: subtitle,
  })
  if (result.status !== 'published') throw new Error(result.status)
  return result.releaseId
}

const publishedSubtitle = async (t: ReturnType<typeof setup>) =>
  (await t.query(api.content.store.getPublished, { ...profile, locale: 'it' }))
    ?.content?.subtitle

test('rollback restores any earlier release and leaves the draft alone', async () => {
  const t = setup()
  const first = await publishSubtitle(t, 'Uno')
  const second = await publishSubtitle(t, 'Due')
  await publishSubtitle(t, 'Tre')
  await t.mutation(internal.content.store.saveDraft, {
    ...profile,
    locale: 'it',
    content: { subtitle: 'Bozza' },
  })

  await t.mutation(internal.content.store.rollback, { releaseId: first })
  expect(await publishedSubtitle(t)).toBe('Uno')

  await t.mutation(internal.content.store.rollback, { releaseId: second })
  expect(await publishedSubtitle(t)).toBe('Due')

  // The draft is the owner's work in progress; rollback never touches it.
  await t.mutation(internal.content.store.publish, {
    selection: [profile],
    note: 'Dopo il rollback',
  })
  expect(await publishedSubtitle(t)).toBe('Bozza')
})

test('rollback is itself a release that can be rolled back', async () => {
  const t = setup()
  const first = await publishSubtitle(t, 'Uno')
  await publishSubtitle(t, 'Due')

  const { releaseId: rollbackId } = await t.mutation(
    internal.content.store.rollback,
    { releaseId: first },
  )
  await publishSubtitle(t, 'Tre')
  await t.mutation(internal.content.store.rollback, { releaseId: rollbackId })

  expect(await publishedSubtitle(t)).toBe('Uno')
})

describe('scheduled publish', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('goes live at its time with the drafts as they were when scheduled', async () => {
    const t = setup()
    await publishSubtitle(t, 'Adesso')
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Domani' },
    })

    const at = Date.now() + 24 * 60 * 60 * 1000
    const result = await t.mutation(internal.content.store.publish, {
      selection: [profile],
      note: 'Programmata',
      at,
    })
    expect(result.status).toBe('scheduled')

    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Ancora in bozza' },
    })
    expect(await publishedSubtitle(t)).toBe('Adesso')

    vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    await t.finishInProgressScheduledFunctions()
    expect(await publishedSubtitle(t)).toBe('Domani')
  })

  test('a time in the past publishes now', async () => {
    const t = setup()
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Subito' },
    })
    const result = await t.mutation(internal.content.store.publish, {
      selection: [profile],
      note: 'Passato',
      at: Date.now() - 1000,
    })
    expect(result.status).toBe('published')
    expect(await publishedSubtitle(t)).toBe('Subito')
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
    publishRules.push(placeholderRule)
  })
  afterEach(() => {
    publishRules.length = 0
    vi.useRealTimers()
  })

  test('a block finding aborts the publish and nothing goes live', async () => {
    const t = setup()
    await publishSubtitle(t, 'Buona')
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'en',
      content: { subtitle: '[da scrivere]' },
    })

    const result = await t.mutation(internal.content.store.publish, {
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
    expect(await publishedSubtitle(t)).toBe('Buona')
  })

  test('warn findings publish and come back with the release', async () => {
    const t = setup()
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Quasi TODO' },
    })

    const result = await t.mutation(internal.content.store.publish, {
      selection: [profile],
      note: 'Con avvisi',
    })

    expect(result.status).toBe('published')
    expect(result.findings.map((finding) => finding.rule)).toEqual(['todo'])
    expect(await publishedSubtitle(t)).toBe('Quasi TODO')
  })

  test('a scheduled release fails if a rule blocks it when it comes due', async () => {
    vi.useFakeTimers()
    const t = setup()
    await publishSubtitle(t, 'Prima')
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'Dopo [anno]' },
    })
    // Scheduled while the rule set is still empty...
    publishRules.length = 0
    await t.mutation(internal.content.store.publish, {
      selection: [profile],
      note: 'Programmata',
      at: Date.now() + 60_000,
    })
    // ...then the rules are tightened before it runs.
    publishRules.push(placeholderRule)

    vi.advanceTimersByTime(60_000)
    await t.finishInProgressScheduledFunctions()
    expect(await publishedSubtitle(t)).toBe('Prima')
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

  async function previewOfDraft(t: ReturnType<typeof setup>) {
    await publishSubtitle(t, 'Pubblicata')
    await t.mutation(internal.content.store.saveDraft, {
      ...profile,
      locale: 'it',
      content: { subtitle: 'In bozza' },
    })
    const { token } = await t.mutation(
      internal.content.store.createPreviewToken,
      { ...profile, locale: 'it' },
    )
    return token
  }

  test('a preview token reads the draft while the public reads the release', async () => {
    const t = setup()
    const token = await previewOfDraft(t)

    const draft = await t.query(api.content.store.getDraft, { token })
    expect(draft?.content?.subtitle).toBe('In bozza')
    expect(await publishedSubtitle(t)).toBe('Pubblicata')
  })

  test('a preview token expires', async () => {
    vi.useFakeTimers()
    const t = setup()
    const token = await previewOfDraft(t)

    vi.advanceTimersByTime(60 * 60 * 1000 + 1)
    expect(await t.query(api.content.store.getDraft, { token })).toBeNull()
  })

  test('a tampered or foreign token reads nothing', async () => {
    const t = setup()
    const token = await previewOfDraft(t)
    const [payload, signature] = token.split('.')
    const forged = btoa(
      JSON.stringify({
        ...JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))),
        locale: 'en',
      }),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    for (const bad of [`${forged}.${signature}`, 'not-a-token', '']) {
      expect(
        await t.query(api.content.store.getDraft, { token: bad }),
      ).toBeNull()
    }

    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'another-secret')
    expect(await t.query(api.content.store.getDraft, { token })).toBeNull()
  })
})
