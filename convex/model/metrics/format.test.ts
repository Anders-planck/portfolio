import { expect, test } from 'vitest'

import { formatMetricFigure } from './format'

const EXACT = 'exact'
const COMPACT = 'compact'

test('a count is grouped the way each locale writes thousands', () => {
  const figure = { value: 8489, total: null }

  expect(formatMetricFigure(figure, 'count', 'it', EXACT)).toBe('8.489')
  expect(formatMetricFigure(figure, 'count', 'en', EXACT)).toBe('8,489')
  expect(formatMetricFigure(figure, 'count', 'fr', EXACT)).toBe('8 489')
  expect(formatMetricFigure(figure, 'count', 'de', EXACT)).toBe('8.489')
})

test('a count of a total shows both, as in 157/157', () => {
  expect(
    formatMetricFigure(
      { value: 157, total: 157 },
      'count-of-total',
      'it',
      EXACT,
    ),
  ).toBe('157/157')
})

test('a count of a total without its total shows the count only', () => {
  expect(
    formatMetricFigure(
      { value: 31, total: null },
      'count-of-total',
      'it',
      EXACT,
    ),
  ).toBe('31')
})

test('a lower bound ends with a plus', () => {
  expect(
    formatMetricFigure({ value: 750, total: null }, 'at-least', 'it', EXACT),
  ).toBe('750+')
})

test('compact rounding shows figures above ten thousand as thousands, rounded down', () => {
  const figure = { value: 12_999, total: null }

  expect(formatMetricFigure(figure, 'count', 'it', COMPACT)).toBe('12k+')
  expect(formatMetricFigure(figure, 'at-least', 'it', COMPACT)).toBe('12k+')
  expect(formatMetricFigure(figure, 'count', 'it', EXACT)).toBe('12.999')
})

test('compact rounding leaves ten thousand and below exact', () => {
  expect(
    formatMetricFigure({ value: 10_000, total: null }, 'count', 'it', COMPACT),
  ).toBe('10.000')
})

test('compact rounding of a large count shows the thousands separator', () => {
  expect(
    formatMetricFigure(
      { value: 1_234_567, total: null },
      'count',
      'it',
      COMPACT,
    ),
  ).toBe('1.234k+')
})
