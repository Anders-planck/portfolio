import { v } from 'convex/values'

import { internalMutation } from './_generated/server'
import { type DraftEdit, saveDraftEdit } from './model/content/drafts'
import {
  publishSelection,
  readPublishedDocument,
} from './model/content/releases'

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
}

/**
 * Publishes the seed profile. Run with `bunx convex run seed:profile`; it
 * does nothing once a profile has been published, so retries are safe.
 */
export const profile = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ref = { collection: SEED_PROFILE.collection, key: SEED_PROFILE.key }
    const published = await readPublishedDocument(ctx, ref, 'it')
    if (published !== null) {
      return null
    }
    const now = Date.now()
    await saveDraftEdit(ctx, SEED_PROFILE, now)
    await publishSelection(
      ctx,
      { selection: [ref], note: 'Profilo iniziale' },
      now,
    )
    return null
  },
})
