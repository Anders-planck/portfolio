// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vitest'

import {
  readEntranceTiming,
  toMillisecondsFromCssTime,
} from './read-entrance-timing'

afterEach(() => {
  document.body.removeAttribute('style')
})

test.each([
  ['700ms', 700],
  [' 0.7s ', 700],
  ['1050ms', 1050],
  ['', 0],
  ['fast', 0],
  ['12', 0],
])('%j is %d ms', (cssTime, milliseconds) => {
  expect(toMillisecondsFromCssTime(cssTime)).toBe(milliseconds)
})

test('an entrance reads the slow duration and entrance curve where it sits', () => {
  document.body.style.setProperty('--duration-slow', '1050ms')
  document.body.style.setProperty(
    '--ease-entrance',
    'cubic-bezier(0.3, 1.2, 0.5, 1)',
  )
  expect(readEntranceTiming(document.body)).toEqual({
    durationMs: 1050,
    easing: 'cubic-bezier(0.3, 1.2, 0.5, 1)',
  })
})

test('before the theme applies, the entrance is instant with a plain curve', () => {
  expect(readEntranceTiming(document.body)).toEqual({
    durationMs: 0,
    easing: 'ease-out',
  })
})
