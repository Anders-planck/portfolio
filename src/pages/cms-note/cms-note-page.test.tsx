// @vitest-environment happy-dom
import { QueryClient } from '@tanstack/react-query'
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
  vi,
} from 'vitest'

import { AUTOSAVE_DELAY_MS } from '../../entities/draft/use-draft-autosave'
import {
  type EditableNote,
  noteDraftQueryOptions,
} from '../../entities/note/note-draft'
import { EDITABLE_NOTE } from '../../entities/note/note-draft.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { CmsNotePage } from './cms-note-page'

const mutation = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => mutation }))

const NOTE_KEY = 'note-review'

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

beforeEach(() => {
  mutation.mockReset()
  mutation.mockResolvedValue({ savedAt: Date.now(), revision: 5 })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderEditor(draft: EditableNote | null) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(
    noteDraftQueryOptions(NOTE_KEY, 'it').queryKey,
    draft,
  )
  return renderAtPath(
    <CmsNotePage noteKey={NOTE_KEY} />,
    `/cms/note/${NOTE_KEY}`,
    queryClient,
  )
}

test('the editor opens the draft with its structure, preview and checks', async () => {
  renderEditor(EDITABLE_NOTE)

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Cosa cerco nel codice di un agente',
    }),
  ).toBeDefined()
  expect(screen.getByLabelText('Titolo')).toHaveProperty(
    'value',
    'Cosa cerco nel codice di un agente',
  )
  expect(screen.getByText('Bozza')).toBeDefined()
  expect(screen.getByText('1 min · 6 parole')).toBeDefined()
  expect(
    screen.getByText('Nessun problema: la nota si può pubblicare.'),
  ).toBeDefined()
  expect(
    screen.getByRole('heading', { level: 2, name: 'Il metodo' }),
  ).toBeDefined()
})

test('typing saves the edit of this note and locale after a pause', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  renderEditor(EDITABLE_NOTE)

  fireEvent.change(await screen.findByLabelText('Slug'), {
    target: { value: 'nuovo-slug' },
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
  })

  expect(mutation).toHaveBeenCalledWith({
    key: NOTE_KEY,
    fields: { slug: 'nuovo-slug' },
  })
})

test('a rule the draft breaks is worded for the owner', async () => {
  renderEditor({
    ...EDITABLE_NOTE,
    findings: [
      {
        rule: 'free-numeral',
        severity: 'block',
        field: 'body',
        locale: 'it',
        message: 'Free number "3"',
        collection: 'note',
        key: NOTE_KEY,
      },
    ],
  })

  expect(
    await screen.findByText(
      'C’è un numero scritto a mano: usa un riferimento {{m:chiave}}.',
    ),
  ).toBeDefined()
  expect(screen.getByText('body · IT')).toBeDefined()
})

test('an unknown note key says the note does not exist', async () => {
  renderEditor(null)

  expect(
    await screen.findByRole('heading', { name: 'Questa nota non esiste' }),
  ).toBeDefined()
})
