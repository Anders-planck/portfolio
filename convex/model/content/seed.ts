import type { MutationCtx } from '../../_generated/server'
import { type DraftEdit, saveDraftEdit } from './drafts'
import { readPublishedDocument } from './pointers'
import { publishSelection } from './releases'

/**
 * Seed content, only from verified data in the mockups (PLAN → Seed content).
 * No free numbers (ADR 0004) and nothing about Madisoft beyond the employer
 * name: the mockup subtitle's "quasi 4 anni" and its school-software domain
 * are left out until a metric and the owner's wording replace them.
 */
const SEED_PROFILE: DraftEdit = {
  collection: 'profile',
  key: 'main',
  fields: {
    name: 'Anders Planck',
    email: 'anders@anders-games.com',
    links: [
      {
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/anders-planck-53184b1b4',
      },
      { label: 'GitHub', href: 'https://github.com/Anders-planck' },
    ],
    isAvailable: true,
    skills: {
      frontend: 'React, React Native, TypeScript, TanStack',
      backend: 'PHP/Symfony, Laravel, Node/Bun, FastAPI',
      infra: 'PostgreSQL, Docker, AWS, GCP, CI/CD',
    },
  },
  localeEdit: {
    locale: 'it',
    content: {
      statusLabel: 'Software Engineer @ Madisoft · Ferrara',
      availabilityLabel: 'Disponibile',
      titleLine1: 'Software',
      titleLine2: 'Engineer.',
      subtitle: 'Frontend e full-stack in TypeScript.',
      contactLabel: 'Scrivimi',
      languages: 'Francese madrelingua · italiano · inglese',
    },
  },
}

/**
 * Saves and publishes the seed profile, unless a profile is already published
 * (so retries are safe). A seed that does not publish is a bug: it throws.
 */
export async function publishSeedProfileOnce(ctx: MutationCtx, now: number) {
  const ref = { collection: SEED_PROFILE.collection, key: SEED_PROFILE.key }
  const published = await readPublishedDocument(ctx, ref, 'it')
  if (published !== null) {
    return
  }
  const { revision } = await saveDraftEdit(ctx, SEED_PROFILE, now)
  const outcome = await publishSelection(
    ctx,
    {
      selection: [{ ...ref, revision }],
      note: 'Profilo iniziale',
      requestId: 'seed-profile',
    },
    now,
  )
  if (outcome.status === 'blocked') {
    const messages = outcome.findings.map((finding) => finding.message)
    throw new Error(
      `The seed profile breaks a publish rule: ${messages.join('; ')}`,
    )
  }
  if (outcome.status !== 'published') {
    throw new Error(`The seed profile was not published: ${outcome.status}`)
  }
}
