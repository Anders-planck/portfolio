import type { PublishedProfile } from './profile-query-options'

/** A Profile published in Italian, shaped as `content.getPublished` returns it. */
export const PUBLISHED_PROFILE: PublishedProfile = {
  collection: 'profile',
  key: 'main',
  locale: 'it',
  fields: {
    name: 'Anders Planck',
    email: 'anders@example.com',
    links: [{ label: 'GitHub', href: 'https://github.com/Anders-planck' }],
    isAvailable: true,
    skills: { frontend: '', backend: '', infra: '' },
  },
  content: {
    statusLabel: 'Software Engineer · Ferrara',
    availabilityLabel: 'Disponibile',
    titleLine1: 'Software',
    titleLine2: 'Engineer.',
    subtitle: 'Frontend e full-stack in TypeScript.',
    contactLabel: 'Scrivimi',
    languages: '',
  },
}
