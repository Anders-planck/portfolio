import { afterEach, describe, expect, test, vi } from 'vitest'

import { api } from './_generated/api'
import type { Locale } from './model/content/locales'
import { createOwnerBackend, type SignedInBackend } from './owner.fixture'

type Backend = SignedInBackend

const ONE_DAY_MS = 24 * 60 * 60 * 1000

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

interface NoteDraft {
  key: string
  slug: string
  title?: string
  body?: string
  locale?: Locale
}

/** Creates a note and saves its copy; returns the revision to publish. */
async function writeNote(backend: Backend, draft: NoteDraft) {
  await backend.mutation(api.notes.createNote, { key: draft.key })
  return backend.mutation(api.notes.saveDraft, {
    key: draft.key,
    fields: { slug: draft.slug, topic: 'ai' },
    localeEdit: {
      locale: draft.locale ?? 'it',
      content: {
        title: draft.title ?? `Nota ${draft.slug}`,
        summary: 'Una sintesi.',
        body: draft.body ?? 'Testo della nota.',
      },
    },
  })
}

function publishNote(
  backend: Backend,
  key: string,
  revision: number,
  scheduledAt?: number,
) {
  return backend.mutation(api.content.publish, {
    selection: [{ collection: 'note', key, revision }],
    note: '',
    requestId: crypto.randomUUID(),
    ...(scheduledAt === undefined ? {} : { scheduledAt }),
  })
}

async function writeAndPublishNote(backend: Backend, draft: NoteDraft) {
  const { revision } = await writeNote(backend, draft)
  const outcome = await publishNote(backend, draft.key, revision)
  if (outcome.status !== 'published') {
    throw new Error(`Expected a published note, got ${outcome.status}`)
  }
  return outcome
}

function listPublishedSlugs(backend: Backend) {
  return backend
    .query(api.notes.listPublished, {})
    .then((cards) => cards.map((card) => card.slug))
}

describe('published notes', () => {
  test('a published note is listed and rendered; its draft stays private', async () => {
    const backend = await createOwnerBackend()
    await writeAndPublishNote(backend, {
      key: 'note-review',
      slug: 'review-agenti',
      body: '## Il metodo\n\nChi scrive **non** rivede.',
    })
    await backend.mutation(api.notes.saveDraft, {
      key: 'note-review',
      localeEdit: { locale: 'it', content: { title: 'Bozza non pubblicata' } },
    })

    const page = await backend.query(api.notes.getPublished, {
      slug: 'review-agenti',
    })

    expect(page?.translations).toMatchObject([
      {
        locale: 'it',
        title: [{ kind: 'text', text: 'Nota review-agenti' }],
        outline: [{ id: 'il-metodo', label: 'Il metodo', level: 2 }],
        blocks: [
          { kind: 'heading', id: 'il-metodo' },
          {
            kind: 'paragraph',
            inlines: [
              { text: 'Chi scrive ' },
              { text: 'non', marks: ['strong'] },
              { text: ' rivede.' },
            ],
          },
        ],
      },
    ])
    expect(await listPublishedSlugs(backend)).toEqual(['review-agenti'])
  })

  test('a note never published is neither listed nor readable', async () => {
    const backend = await createOwnerBackend()
    await writeNote(backend, { key: 'note-draft', slug: 'solo-bozza' })

    expect(await listPublishedSlugs(backend)).toEqual([])
    expect(
      await backend.query(api.notes.getPublished, { slug: 'solo-bozza' }),
    ).toBeNull()
  })

  test('next is the older published note, skipping unpublished ones', async () => {
    vi.useFakeTimers()
    const backend = await createOwnerBackend()
    await writeAndPublishNote(backend, { key: 'note-first', slug: 'prima' })
    vi.advanceTimersByTime(ONE_DAY_MS)
    await writeNote(backend, { key: 'note-middle', slug: 'in-scrittura' })
    vi.advanceTimersByTime(ONE_DAY_MS)
    await writeAndPublishNote(backend, { key: 'note-last', slug: 'ultima' })

    const latest = await backend.query(api.notes.getPublished, {
      slug: 'ultima',
    })
    const oldest = await backend.query(api.notes.getPublished, {
      slug: 'prima',
    })

    expect(latest?.next?.slug).toBe('prima')
    expect(oldest?.next).toBeNull()
    expect(await listPublishedSlugs(backend)).toEqual(['ultima', 'prima'])
  })

  test('a metric reference renders the verified figure in each locale', async () => {
    const backend = await createOwnerBackend()
    await backend.mutation(api.metrics.createMetric, {
      key: 'test-files',
      label: 'file di test',
      format: 'count',
      source: { kind: 'manual' },
    })
    await backend.mutation(api.metrics.recordManualCount, {
      key: 'test-files',
      value: 8489,
      countedAt: Date.UTC(2026, 10, 20),
      evidence: 'Conteggio a mano',
    })
    const { revision } = await writeNote(backend, {
      key: 'note-metric',
      slug: 'con-metrica',
      body: 'Ho scritto {{m:test-files}} file.\n\n::metric[file di test]{key="test-files"}',
    })
    await publishNote(backend, 'note-metric', revision)

    const page = await backend.query(api.notes.getPublished, {
      slug: 'con-metrica',
    })

    expect(page?.translations[0]?.blocks).toMatchObject([
      { inlines: [{}, { kind: 'metric', text: '8.489' }, {}] },
      { kind: 'metric', reading: { text: '8.489' } },
    ])
  })
})

describe('publishing a note', () => {
  test('a free numeral in the body blocks the publish', async () => {
    const backend = await createOwnerBackend()
    const { revision } = await writeNote(backend, {
      key: 'note-numeral',
      slug: 'numeri',
      body: 'Ho trovato 3 buchi.',
    })

    const outcome = await publishNote(backend, 'note-numeral', revision)

    expect(outcome).toMatchObject({
      status: 'blocked',
      findings: [{ rule: 'free-numeral', field: 'body', locale: 'it' }],
    })
    expect(await listPublishedSlugs(backend)).toEqual([])
  })

  test('a draft saved after the review is stale and publishes nothing', async () => {
    const backend = await createOwnerBackend()
    const { revision } = await writeNote(backend, {
      key: 'note-stale',
      slug: 'cambiata',
    })
    await backend.mutation(api.notes.saveDraft, {
      key: 'note-stale',
      localeEdit: { locale: 'it', content: { body: 'Cambiata.' } },
    })

    const outcome = await publishNote(backend, 'note-stale', revision)

    expect(outcome.status).toBe('stale')
  })

  test('a scheduled note is listed as scheduled, then goes live', async () => {
    vi.useFakeTimers()
    const backend = await createOwnerBackend()
    const { revision } = await writeNote(backend, {
      key: 'note-later',
      slug: 'domani',
    })
    const scheduledAt = Date.now() + ONE_DAY_MS

    await publishNote(backend, 'note-later', revision, scheduledAt)

    expect(await backend.query(api.notes.listNotes, {})).toMatchObject([
      { key: 'note-later', publication: { kind: 'scheduled', scheduledAt } },
    ])
    expect(await listPublishedSlugs(backend)).toEqual([])

    vi.advanceTimersByTime(ONE_DAY_MS)
    await backend.finishInProgressScheduledFunctions()

    expect(await listPublishedSlugs(backend)).toEqual(['domani'])
    expect(await backend.query(api.notes.listNotes, {})).toMatchObject([
      { publication: { kind: 'published' } },
    ])
  })
})

describe('the CMS', () => {
  test('creating the same note twice (double click) makes one note', async () => {
    const backend = await createOwnerBackend()

    await backend.mutation(api.notes.createNote, { key: 'note-double' })
    await backend.mutation(api.notes.createNote, { key: 'note-double' })

    expect(await backend.query(api.notes.listNotes, {})).toMatchObject([
      { key: 'note-double', title: '', publication: { kind: 'draft' } },
    ])
  })

  test('a note key that is not an editor id is refused', async () => {
    const backend = await createOwnerBackend()

    await expect(
      backend.mutation(api.notes.createNote, { key: 'Not a key!' }),
    ).rejects.toThrow()
  })

  test('the editor shows the draft, its preview and the rules it breaks', async () => {
    const backend = await createOwnerBackend()
    await writeNote(backend, {
      key: 'note-editor',
      slug: 'Slug Sbagliato',
      body: '## Prima\n\n::video{}',
    })

    const editable = await backend.query(api.notes.getEditableNote, {
      key: 'note-editor',
      locale: 'it',
    })

    expect(editable).toMatchObject({
      revision: 1,
      fields: { slug: 'Slug Sbagliato', topic: 'ai' },
      translatedLocales: ['it'],
      publication: { kind: 'draft' },
      preview: { outline: [{ id: 'prima' }], readingMinutes: 1 },
    })
    expect(editable?.findings.map((finding) => finding.rule)).toEqual([
      'note-slug',
      'note-unknown-directive',
    ])
  })

  test('an unknown note opens as null; an untranslated locale as empty', async () => {
    const backend = await createOwnerBackend()
    await writeNote(backend, { key: 'note-italian', slug: 'italiana' })

    expect(
      await backend.query(api.notes.getEditableNote, {
        key: 'note-missing',
        locale: 'it',
      }),
    ).toBeNull()
    expect(
      await backend.query(api.notes.getEditableNote, {
        key: 'note-italian',
        locale: 'de',
      }),
    ).toMatchObject({ content: { title: '', summary: '', body: '' } })
  })
})
