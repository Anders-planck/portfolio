// @vitest-environment happy-dom
import { expect, test } from 'vitest'

import { readCursorTarget } from './read-cursor-target'

function createElementFrom(html: string): Element {
  document.body.innerHTML = html
  const target = document.querySelector('[data-target]')
  if (target === null) {
    throw new Error('the fixture has no [data-target]')
  }
  return target
}

test('over plain text the ring stays small', () => {
  expect(
    readCursorTarget(createElementFrom('<p data-target>testo</p>')),
  ).toEqual({ kind: 'none' })
  expect(readCursorTarget(null)).toEqual({ kind: 'none' })
})

test('over anything inside a link or button the ring grows', () => {
  expect(
    readCursorTarget(
      createElementFrom(
        '<a href="/lavori"><span data-target>Lavori</span></a>',
      ),
    ),
  ).toEqual({ kind: 'link' })
  expect(
    readCursorTarget(createElementFrom('<button data-target>Menu</button>')),
  ).toEqual({ kind: 'link' })
})

test('the nearest data-cursor names the action in the ring', () => {
  expect(
    readCursorTarget(
      createElementFrom(
        '<a href="/lavori/bussola" data-cursor="Apri"><span data-target>Bussola</span></a>',
      ),
    ),
  ).toEqual({ kind: 'label', label: 'Apri' })
})
