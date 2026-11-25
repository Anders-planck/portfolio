/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { Locale } from './model/content/locales'
import { PREVIEW_TOKEN_TTL_MS } from './model/content/preview'
import type * as rulesModule from './model/content/rules'
import type { Finding, Rule } from './model/content/rules'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

// The store's tests choose the server rule set (the rules engine has its own
// tests): publish reads `PUBLISH_RULES`, which returns `serverRules.current`.
const serverRules = vi.hoisted(() => ({ current: [] as readonly Rule[] }))
vi.mock('./model/content/rules', async (importOriginal) => ({
  ...(await importOriginal<typeof rulesModule>()),
  get PUBLISH_RULES() {
    return serverRules.current
  },
}))

const PROFILE = { collection: 'profile', key: 'main' } as const
// A second profile document, for releases that span more than one document.
const OTHER_KEY = 'other'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const PREVIEW_SECRET = 'test-preview-secret-of-at-least-32-bytes'

type Backend = ReturnType<typeof createBackend>

function createBackend() {
  return convexTest(schema, modules)
}

function saveSubtitleDraft(
  backend: Backend,
  subtitle: string,
  locale: Locale = 'it',
  key: string = PROFILE.key,
) {
  return backend.mutation(internal.content.saveDraft, {
    collection: 'profile',
    key,
    localeEdit: { locale, content: { subtitle } },
  })
}

/** Publishes the drafts at the revisions the owner reviewed. */
function publishDrafts(
  backend: Backend,
  drafts: { key: string; revision: number }[],
  options: { scheduledAt?: number; requestId?: string } = {},
) {
  return backend.mutation(internal.content.publish, {
    selection: drafts.map((draft) => ({
      collection: 'profile' as const,
      ...draft,
    })),
    note: 'Nota di rilascio',
    requestId: options.requestId ?? crypto.randomUUID(),
    ...(options.scheduledAt === undefined
      ? {}
      : { scheduledAt: options.scheduledAt }),
  })
}

/** Publishes the main profile draft at `revision`, the one the owner reviewed. */
function publishProfile(
  backend: Backend,
  options: { revision: number; scheduledAt?: number; requestId?: string },
) {
  const { revision, ...rest } = options
  return publishDrafts(backend, [{ key: PROFILE.key, revision }], rest)
}

/** Saves the subtitle and publishes it now; returns the release. */
async function publishSubtitle(
  backend: Backend,
  subtitle: string,
  key: string = PROFILE.key,
) {
  const { revision } = await saveSubtitleDraft(backend, subtitle, 'it', key)
  const outcome = await publishDrafts(backend, [{ key, revision }])
  if (outcome.status !== 'published') {
    throw new Error(`Expected a published release, got ${outcome.status}`)
  }
  return outcome.releaseId
}

function rollBack(
  backend: Backend,
  releaseId: Awaited<ReturnType<typeof publishSubtitle>>,
) {
  return backend.mutation(internal.content.rollback, {
    releaseId,
    requestId: crypto.randomUUID(),
  })
}

function readPublishedProfile(
  backend: Backend,
  locale: Locale = 'it',
  key: string = PROFILE.key,
) {
  return backend.query(api.content.getPublished, {
    collection: 'profile',
    key,
    locale,
  })
}

async function readPublishedSubtitle(
  backend: Backend,
  key: string = PROFILE.key,
) {
  return (await readPublishedProfile(backend, 'it', key))?.content?.subtitle
}

/** The release row: no release history query exists yet (CMS ticket). */
function readRelease(backend: Backend, releaseId: Id<'releases'>) {
  return backend.run((ctx) => ctx.db.get(releaseId))
}

function countReleases(backend: Backend) {
  return backend.run(
    async (ctx) => (await ctx.db.query('releases').take(100)).length,
  )
}

describe('publish', () => {
  test('nothing is public before the first publish', async () => {
    const backend = createBackend()
    await saveSubtitleDraft(backend, 'Bozza')

    expect(await readPublishedProfile(backend)).toBeNull()
  })

  test('publishing makes the draft public for its locale', async () => {
    const backend = createBackend()
    const { revision } = await backend.mutation(internal.content.saveDraft, {
      ...PROFILE,
      fields: { name: 'Anders Planck' },
      localeEdit: {
        locale: 'it',
        content: { titleLine1: 'Software', titleLine2: 'Engineer.' },
      },
    })

    await publishProfile(backend, { revision })

    const published = await readPublishedProfile(backend)
    expect(published?.fields.name).toBe('Anders Planck')
    expect(published?.content).toMatchObject({
      titleLine1: 'Software',
      titleLine2: 'Engineer.',
    })
  })

  test('later draft edits stay private until the next publish', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Prima')

    const { revision } = await saveSubtitleDraft(backend, 'Seconda')
    expect(await readPublishedSubtitle(backend)).toBe('Prima')

    await publishProfile(backend, { revision })
    expect(await readPublishedSubtitle(backend)).toBe('Seconda')
  })

  test('each locale reads its own content; a missing locale has none', async () => {
    const backend = createBackend()
    await saveSubtitleDraft(backend, 'Italiano', 'it')
    const { revision } = await saveSubtitleDraft(backend, 'English', 'en')

    await publishProfile(backend, { revision })

    expect((await readPublishedProfile(backend, 'it'))?.content?.subtitle).toBe(
      'Italiano',
    )
    expect((await readPublishedProfile(backend, 'en'))?.content?.subtitle).toBe(
      'English',
    )
    expect((await readPublishedProfile(backend, 'fr'))?.content).toBeNull()
  })

  test('publishing a document without a draft fails', async () => {
    const backend = createBackend()

    await expect(publishProfile(backend, { revision: 1 })).rejects.toThrow(
      /No draft/,
    )
  })

  test('a repeated publish request (double click, retry) publishes once', async () => {
    const backend = createBackend()
    const { revision } = await saveSubtitleDraft(backend, 'Una volta')

    const first = await publishProfile(backend, {
      revision,
      requestId: 'publish-once',
    })
    // The response was lost, the owner edits on, the client retries.
    await saveSubtitleDraft(backend, 'Dopo il retry')
    const retry = await publishProfile(backend, {
      revision,
      requestId: 'publish-once',
    })

    expect(retry).toEqual(first)
    expect(await countReleases(backend)).toBe(1)
    expect(await readPublishedSubtitle(backend)).toBe('Una volta')
  })

  test('a draft edited after the owner reviewed it is not published', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Pubblicata')
    const { revision: reviewed } = await saveSubtitleDraft(backend, 'Rivista')
    // Another tab saves while the owner reads the diff.
    await saveSubtitleDraft(backend, 'Cambiata in un altra scheda')

    const outcome = await publishProfile(backend, { revision: reviewed })

    expect(outcome).toEqual({
      status: 'stale',
      documents: [{ collection: 'profile', key: 'main' }],
    })
    expect(await readPublishedSubtitle(backend)).toBe('Pubblicata')
  })
})

describe('publish request checks', () => {
  test('publish checks the request before it writes anything', async () => {
    const backend = createBackend()
    const { revision } = await saveSubtitleDraft(backend, 'Doppia')

    await expect(
      publishDrafts(backend, [
        { key: PROFILE.key, revision },
        { key: PROFILE.key, revision },
      ]),
    ).rejects.toThrow(/more than once/)
    expect(await countReleases(backend)).toBe(0)
  })

  test('a publish request id cannot be reused for a rollback', async () => {
    const backend = createBackend()
    const { revision } = await saveSubtitleDraft(backend, 'Uno')
    const outcome = await publishProfile(backend, {
      revision,
      requestId: 'shared-id',
    })
    if (outcome.status !== 'published') {
      throw new Error('Expected a published release')
    }

    await expect(
      backend.mutation(internal.content.rollback, {
        releaseId: outcome.releaseId,
        requestId: 'shared-id',
      }),
    ).rejects.toThrow(/already used/)
  })
})

describe('rollback', () => {
  test('only a published release can be rolled back to', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Uno')
    const { revision } = await saveSubtitleDraft(backend, 'Domani')
    const scheduled = await publishProfile(backend, {
      revision,
      scheduledAt: Date.now() + ONE_DAY_MS,
    })
    if (scheduled.status !== 'scheduled') {
      throw new Error('Expected a scheduled release')
    }

    await expect(rollBack(backend, scheduled.releaseId)).rejects.toThrow(
      /Only a published release/,
    )
    expect(await readPublishedSubtitle(backend)).toBe('Uno')
  })

  test('restores the whole site as it was: later documents become unpublished', async () => {
    const backend = createBackend()
    const first = await publishSubtitle(backend, 'Uno')
    const second = await publishSubtitle(backend, 'Altro', OTHER_KEY)

    await rollBack(backend, first)
    expect(await readPublishedSubtitle(backend)).toBe('Uno')
    expect(await readPublishedProfile(backend, 'it', OTHER_KEY)).toBeNull()

    await rollBack(backend, second)
    expect(await readPublishedSubtitle(backend, OTHER_KEY)).toBe('Altro')
  })
  test('restores any earlier release and leaves the draft alone', async () => {
    const backend = createBackend()
    const first = await publishSubtitle(backend, 'Uno')
    const second = await publishSubtitle(backend, 'Due')
    await publishSubtitle(backend, 'Tre')
    const { revision } = await saveSubtitleDraft(backend, 'Bozza')

    await rollBack(backend, first)
    expect(await readPublishedSubtitle(backend)).toBe('Uno')

    await rollBack(backend, second)
    expect(await readPublishedSubtitle(backend)).toBe('Due')

    // The draft is the owner's work in progress; rollback never touches it.
    await publishProfile(backend, { revision })
    expect(await readPublishedSubtitle(backend)).toBe('Bozza')
  })

  test('a rollback is itself a release that can be rolled back to', async () => {
    const backend = createBackend()
    const first = await publishSubtitle(backend, 'Uno')
    await publishSubtitle(backend, 'Due')

    const { releaseId: rollbackId } = await rollBack(backend, first)
    await publishSubtitle(backend, 'Tre')
    await rollBack(backend, rollbackId)

    expect(await readPublishedSubtitle(backend)).toBe('Uno')
  })

  test('a repeated rollback request rolls back once', async () => {
    const backend = createBackend()
    const first = await publishSubtitle(backend, 'Uno')
    await publishSubtitle(backend, 'Due')
    const request = { releaseId: first, requestId: 'rollback-once' }

    const rollback = await backend.mutation(internal.content.rollback, request)
    const retry = await backend.mutation(internal.content.rollback, request)

    expect(retry).toEqual(rollback)
    expect(await countReleases(backend)).toBe(3)
  })
})

describe('scheduled publish', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('goes live at its time with the drafts as they were when scheduled', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Adesso')
    const { revision } = await saveSubtitleDraft(backend, 'Domani')

    const outcome = await publishProfile(backend, {
      revision,
      scheduledAt: Date.now() + ONE_DAY_MS,
    })
    expect(outcome.status).toBe('scheduled')

    await saveSubtitleDraft(backend, 'Ancora in bozza')
    expect(await readPublishedSubtitle(backend)).toBe('Adesso')

    vi.advanceTimersByTime(ONE_DAY_MS)
    await backend.finishInProgressScheduledFunctions()
    expect(await readPublishedSubtitle(backend)).toBe('Domani')
  })

  test('a time in the past publishes now', async () => {
    const backend = createBackend()
    const { revision } = await saveSubtitleDraft(backend, 'Subito')

    const outcome = await publishProfile(backend, {
      revision,
      scheduledAt: Date.now() - 1000,
    })

    expect(outcome.status).toBe('published')
    expect(await readPublishedSubtitle(backend)).toBe('Subito')
  })

  test('a later publish wins: the scheduled release fails with a conflict and applies nothing', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Adesso')
    const main = await saveSubtitleDraft(backend, 'Domani')
    const other = await saveSubtitleDraft(
      backend,
      'Altro domani',
      'it',
      OTHER_KEY,
    )
    const scheduled = await publishDrafts(
      backend,
      [
        { key: PROFILE.key, revision: main.revision },
        { key: OTHER_KEY, revision: other.revision },
      ],
      { scheduledAt: Date.now() + ONE_DAY_MS },
    )
    if (scheduled.status !== 'scheduled') {
      throw new Error('Expected a scheduled release')
    }

    await publishSubtitle(backend, 'Più nuova')
    vi.advanceTimersByTime(ONE_DAY_MS)
    await backend.finishInProgressScheduledFunctions()

    expect(await readPublishedSubtitle(backend)).toBe('Più nuova')
    expect(await readPublishedProfile(backend, 'it', OTHER_KEY)).toBeNull()
    expect(await readRelease(backend, scheduled.releaseId)).toMatchObject({
      status: 'failed',
      failure: {
        kind: 'conflict',
        documents: [{ collection: 'profile', key: PROFILE.key }],
      },
    })
  })

  test('a later rollback wins: the scheduled release fails with a conflict', async () => {
    const backend = createBackend()
    const first = await publishSubtitle(backend, 'Uno')
    await publishSubtitle(backend, 'Due')
    const { revision } = await saveSubtitleDraft(backend, 'Tre')
    const scheduled = await publishProfile(backend, {
      revision,
      scheduledAt: Date.now() + ONE_DAY_MS,
    })
    if (scheduled.status !== 'scheduled') {
      throw new Error('Expected a scheduled release')
    }

    await rollBack(backend, first)
    vi.advanceTimersByTime(ONE_DAY_MS)
    await backend.finishInProgressScheduledFunctions()

    expect(await readPublishedSubtitle(backend)).toBe('Uno')
    expect(await readRelease(backend, scheduled.releaseId)).toMatchObject({
      status: 'failed',
      failure: { kind: 'conflict' },
    })
  })
})

describe('rules at publish', () => {
  // A stand-in rule: placeholders `[...]` block, the word "TODO" warns.
  const placeholderRule: Rule = (snapshot) =>
    snapshot.content.flatMap((record): Finding[] => [
      ...(/\[.*\]/.test(record.subtitle)
        ? [
            {
              rule: 'placeholder',
              severity: 'block' as const,
              field: 'subtitle',
              locale: record.locale,
              message: 'Placeholder left in the copy',
            },
          ]
        : []),
      ...(record.subtitle.includes('TODO')
        ? [
            {
              rule: 'todo',
              severity: 'warn' as const,
              field: 'subtitle',
              locale: record.locale,
              message: 'TODO left in the copy',
            },
          ]
        : []),
    ])

  beforeEach(() => {
    serverRules.current = [placeholderRule]
  })
  afterEach(() => {
    serverRules.current = []
    vi.useRealTimers()
  })

  test('a block finding stops the publish and nothing goes live', async () => {
    const backend = createBackend()
    await publishSubtitle(backend, 'Buona')
    const { revision } = await saveSubtitleDraft(backend, '[da scrivere]', 'en')

    const outcome = await publishProfile(backend, { revision })

    expect(outcome).toEqual({
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
    expect(await readPublishedSubtitle(backend)).toBe('Buona')
  })

  test('warn findings publish and come back with the release', async () => {
    const backend = createBackend()
    const { revision } = await saveSubtitleDraft(backend, 'Quasi TODO')

    const outcome = await publishProfile(backend, { revision })

    expect(outcome).toMatchObject({
      status: 'published',
      findings: [{ rule: 'todo', severity: 'warn', locale: 'it' }],
    })
    expect(await readPublishedSubtitle(backend)).toBe('Quasi TODO')
  })

  test('a scheduled release fails if a rule blocks it when it comes due', async () => {
    vi.useFakeTimers()
    const backend = createBackend()
    await publishSubtitle(backend, 'Prima')
    const { revision } = await saveSubtitleDraft(backend, 'Dopo [anno]')
    // Scheduled while the rule set is still empty...
    serverRules.current = []
    const outcome = await publishProfile(backend, {
      revision,
      scheduledAt: Date.now() + 60_000,
    })
    if (outcome.status !== 'scheduled') {
      throw new Error('Expected the release to be scheduled')
    }
    // ...then the rules are tightened before it runs.
    serverRules.current = [placeholderRule]

    vi.advanceTimersByTime(60_000)
    await backend.finishInProgressScheduledFunctions()

    expect(await readPublishedSubtitle(backend)).toBe('Prima')
    expect(await readRelease(backend, outcome.releaseId)).toMatchObject({
      status: 'failed',
      failedAt: Date.now(),
      failure: { kind: 'rules' },
      findings: [{ rule: 'placeholder', severity: 'block', locale: 'it' }],
    })
  })
})

describe('preview', () => {
  beforeEach(() => {
    vi.stubEnv('PREVIEW_TOKEN_SECRET', PREVIEW_SECRET)
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  /** Publishes one subtitle, drafts another, and returns a preview token. */
  async function createPreviewOfDraft(backend: Backend) {
    await publishSubtitle(backend, 'Pubblicata')
    await saveSubtitleDraft(backend, 'In bozza')
    const { token } = await backend.mutation(
      internal.content.createPreviewToken,
      {
        ...PROFILE,
        locale: 'it',
      },
    )
    return token
  }

  test('a preview token reads the draft while the public reads the release', async () => {
    const backend = createBackend()
    const token = await createPreviewOfDraft(backend)

    const preview = await backend.action(api.content.getDraft, { token })

    expect(preview).toMatchObject({
      status: 'ready',
      document: { content: { subtitle: 'In bozza' } },
    })
    expect(await readPublishedSubtitle(backend)).toBe('Pubblicata')
  })

  test('a link read again after it expired is expired, not an earlier answer', async () => {
    vi.useFakeTimers()
    const backend = createBackend()
    const token = await createPreviewOfDraft(backend)
    expect(await backend.action(api.content.getDraft, { token })).toMatchObject(
      {
        status: 'ready',
      },
    )

    vi.advanceTimersByTime(PREVIEW_TOKEN_TTL_MS + 1)

    expect(await backend.action(api.content.getDraft, { token })).toEqual({
      status: 'expired',
    })
  })

  test('rotating the secret invalidates earlier preview links', async () => {
    const backend = createBackend()
    const token = await createPreviewOfDraft(backend)

    vi.stubEnv('PREVIEW_TOKEN_SECRET', `another-${PREVIEW_SECRET}`)

    await expect(
      backend.action(api.content.getDraft, { token }),
    ).rejects.toThrow(/not issued by this site/)
  })

  test('a preview secret shorter than 32 bytes is refused', async () => {
    const backend = createBackend()
    await saveSubtitleDraft(backend, 'In bozza')
    vi.stubEnv('PREVIEW_TOKEN_SECRET', 'too-short')

    await expect(
      backend.mutation(internal.content.createPreviewToken, {
        ...PROFILE,
        locale: 'it',
      }),
    ).rejects.toThrow(/at least 32 bytes/)
  })

  test('a link for a document without a draft shows no draft', async () => {
    const backend = createBackend()
    const { token } = await backend.mutation(
      internal.content.createPreviewToken,
      { collection: 'profile', key: OTHER_KEY, locale: 'it' },
    )

    expect(await backend.action(api.content.getDraft, { token })).toEqual({
      status: 'no-draft',
    })
  })
})
