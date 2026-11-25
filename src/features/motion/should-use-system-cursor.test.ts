// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vitest'

import { shouldUseSystemCursor } from './should-use-system-cursor'

afterEach(() => {
  document.body.innerHTML = ''
})

function createElementFrom(html: string): Element {
  document.body.innerHTML = html
  const target = document.querySelector('[data-target]')
  if (target === null) {
    throw new Error('the fixture has no [data-target]')
  }
  return target
}

test('a mouse over the page draws the custom cursor', () => {
  const target = createElementFrom('<a href="/lavori" data-target>Lavori</a>')
  expect(shouldUseSystemCursor({ target, pointerType: 'mouse' })).toBe(false)
})

test.each(['pen', 'touch'])('a %s keeps the system cursor', (pointerType) => {
  const target = createElementFrom('<p data-target>testo</p>')
  expect(shouldUseSystemCursor({ target, pointerType })).toBe(true)
})

test.each([
  '<input data-target>',
  '<input type="email" data-target>',
  '<textarea data-target></textarea>',
  '<p contenteditable="true"><span data-target>testo</span></p>',
])('text entry keeps the native I-beam: %s', (html) => {
  expect(
    shouldUseSystemCursor({
      target: createElementFrom(html),
      pointerType: 'mouse',
    }),
  ).toBe(true)
})

test('a checkbox is not text entry', () => {
  expect(
    shouldUseSystemCursor({
      target: createElementFrom('<input type="checkbox" data-target>'),
      pointerType: 'mouse',
    }),
  ).toBe(false)
})

test.each([
  '<dialog open><p>menu</p></dialog><p data-target>testo</p>',
  '<div role="dialog" aria-modal="true"></div><p data-target>testo</p>',
  '<div role="menu"></div><p data-target>testo</p>',
])(
  'while a surface over the page is open the system cursor shows: %s',
  (html) => {
    expect(
      shouldUseSystemCursor({
        target: createElementFrom(html),
        pointerType: 'mouse',
      }),
    ).toBe(true)
  },
)
