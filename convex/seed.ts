import { v } from 'convex/values'
import { api, internal } from './_generated/api'
import { internalMutation } from './_generated/server'

/**
 * Seed content, only from verified data in the mockups (PLAN → Seed content).
 * No free numbers (ADR 0004) and nothing about Madisoft beyond the employer
 * name: the mockup subtitle's "quasi 4 anni" and its school-software domain
 * are left out until a metric and the owner's wording replace them.
 *
 * Run with `bunx convex run seed:profile`; it does nothing once a profile
 * has been published.
 */
export const profile = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const ref = { collection: 'profile', key: 'main' } as const
    const published = await ctx.runQuery(api.content.store.getPublished, {
      ...ref,
      locale: 'it',
    })
    if (published) return null

    await ctx.runMutation(internal.content.store.saveDraft, {
      ...ref,
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
        showAvailability: true,
        skills: {
          frontend: 'React, React Native, TypeScript, TanStack',
          backend: 'PHP/Symfony, Laravel, Node/Bun, FastAPI',
          infra: 'PostgreSQL, Docker, AWS, GCP, CI/CD',
        },
      },
      locale: 'it',
      content: {
        statusLabel: 'Software Engineer @ Madisoft · Ferrara',
        titleLine1: 'Software',
        titleLine2: 'Engineer.',
        subtitle: 'Frontend e full-stack in TypeScript.',
        languages: 'Francese madrelingua · italiano · inglese',
      },
    })
    await ctx.runMutation(internal.content.store.publish, {
      selection: [ref],
      note: 'Profilo iniziale',
    })
    return null
  },
})
