// @vitest-environment happy-dom
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
import { EDITABLE_NOTE } from '../../entities/note/note-draft.fixture'
import { renderAtPath } from '../../shared/i18n/render-at-path.fixture'
import { NoteWorkspace } from './note-workspace'

const mutation = vi.hoisted(() => vi.fn())
vi.mock('convex/react', () => ({ useMutation: () => mutation }))

// happy-dom rejects the `finished` promise of the animations the locale
// switch (SegmentedControl) cancels on unmount; without Web Animations the
// control does not animate.
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
  vi.useFakeTimers({ shouldAdvanceTime: true })
  mutation.mockReset()
  mutation.mockResolvedValue({ savedAt: Date.now(), revision: 5 })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function isDisabled(element: HTMLElement) {
  return (
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true'
  )
}

test('an untitled note is named so, and the saved draft is previewed', async () => {
  renderAtPath(
    <NoteWorkspace
      noteKey="note-a"
      draft={{
        ...EDITABLE_NOTE,
        content: { ...EDITABLE_NOTE.content, title: '' },
      }}
      locale="it"
      onLocaleChange={vi.fn()}
    />,
    '/cms/note/note-a',
  )

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Nota senza titolo' }),
  ).toBeDefined()
  expect(
    screen.getByRole('heading', { level: 2, name: 'Il metodo' }),
  ).toBeDefined()
})

test('publishing and switching language wait until every edit is saved', async () => {
  const onLocaleChange = vi.fn()
  renderAtPath(
    <NoteWorkspace
      noteKey="note-a"
      draft={EDITABLE_NOTE}
      locale="it"
      onLocaleChange={onLocaleChange}
    />,
    '/cms/note/note-a',
  )

  fireEvent.change(await screen.findByLabelText('Sintesi'), {
    target: { value: 'Nuova sintesi' },
  })
  expect(isDisabled(screen.getByRole('button', { name: 'Pubblica ora' }))).toBe(
    true,
  )
  await act(async () => {
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS)
  })

  expect(isDisabled(screen.getByRole('button', { name: 'Pubblica ora' }))).toBe(
    false,
  )
  fireEvent.click(screen.getByRole('radio', { name: 'EN' }))
  expect(onLocaleChange).toHaveBeenCalledWith('en')
})
