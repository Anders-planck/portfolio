// @vitest-environment happy-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'

import {
  type EditableProfileDraft,
  profileDraftQueryOptions,
} from '../../entities/profile/profile-draft'
import { CmsProfilePage } from './cms-profile-page'

const saveDraft = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => saveDraft }))

afterEach(cleanup)

// happy-dom rejects the `finished` promise of the animations the locale
// switch (SegmentedControl) cancels on unmount, and nothing handles it there.
// Without Web Animations the control does not animate.
const animate = Object.getOwnPropertyDescriptor(Element.prototype, 'animate')
beforeAll(() => {
  Object.defineProperty(Element.prototype, 'animate', {
    value: undefined,
    configurable: true,
  })
})
afterAll(() => {
  if (animate !== undefined) {
    Object.defineProperty(Element.prototype, 'animate', animate)
  }
})

const SAVED_DRAFT: EditableProfileDraft = {
  revision: 3,
  savedAt: new Date(2026, 10, 25, 10, 42).getTime(),
  fields: {
    name: 'Anders Planck',
    email: 'anders@example.com',
    links: [],
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

function renderPage(seed: (queryClient: QueryClient) => void) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  seed(queryClient)
  render(
    <QueryClientProvider client={queryClient}>
      <CmsProfilePage />
    </QueryClientProvider>,
  )
}

test('the Profile opens on the saved draft, with when it was saved', () => {
  renderPage((queryClient) => {
    queryClient.setQueryData(
      profileDraftQueryOptions('it').queryKey,
      SAVED_DRAFT,
    )
  })

  expect(
    screen.getByRole('heading', { level: 1, name: 'Profilo' }),
  ).toBeDefined()
  expect(
    screen.getByLabelText<HTMLInputElement>('Testo del pulsante di contatto')
      .value,
  ).toBe('Scrivimi')
  expect(screen.getByText('Salvato · 10:42')).toBeDefined()
})

test('an unsaved edit holds back publish and the locale switch', () => {
  renderPage((queryClient) => {
    queryClient.setQueryData(
      profileDraftQueryOptions('it').queryKey,
      SAVED_DRAFT,
    )
  })

  fireEvent.change(screen.getByLabelText('Sottotitolo'), {
    target: { value: 'Nuovo' },
  })

  expect(screen.getByText('Modifiche da salvare…')).toBeDefined()
  expect(
    screen
      .getByRole('button', { name: 'Pubblica' })
      .getAttribute('aria-disabled'),
  ).toBe('true')
})

test('while the draft loads the page says so', () => {
  renderPage(() => undefined)

  expect(screen.getByText('Caricamento della bozza…')).toBeDefined()
})
