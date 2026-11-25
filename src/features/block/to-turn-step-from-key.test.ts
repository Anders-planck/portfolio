import { expect, test } from 'vitest'

import { toTurnStepFromKey } from './to-turn-step-from-key'

const PLAIN = { altKey: false, ctrlKey: false, metaKey: false, shiftKey: false }

test('the left and right arrows turn one face back and on', () => {
  expect(toTurnStepFromKey({ ...PLAIN, key: 'ArrowLeft' }, 2)).toBe(-1)
  expect(toTurnStepFromKey({ ...PLAIN, key: 'ArrowRight' }, 2)).toBe(1)
})

test('Home and End turn to the first and the last face', () => {
  expect(toTurnStepFromKey({ ...PLAIN, key: 'Home' }, 2)).toBe(-2)
  expect(toTurnStepFromKey({ ...PLAIN, key: 'End' }, 1)).toBe(2)
})

test('Up and Down are left to the page, so they keep scrolling it', () => {
  expect(toTurnStepFromKey({ ...PLAIN, key: 'ArrowUp' }, 0)).toBeUndefined()
  expect(toTurnStepFromKey({ ...PLAIN, key: 'ArrowDown' }, 0)).toBeUndefined()
})

test('a key with any modifier is left to the browser', () => {
  const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const
  expect(
    modifiers.map((modifier) =>
      toTurnStepFromKey({ ...PLAIN, key: 'ArrowRight', [modifier]: true }, 0),
    ),
  ).toEqual([undefined, undefined, undefined, undefined])
})
