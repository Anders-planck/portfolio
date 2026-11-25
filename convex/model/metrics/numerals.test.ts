import { expect, test } from 'vitest'

import { findFreeNumerals } from './numerals'

test('a figure in prose is a free numeral', () => {
  expect(findFreeNumerals('Software Engineer da quasi 4 anni.')).toEqual(['4'])
})

test('grouped, decimal, ratio, percent and suffixed figures are found whole', () => {
  expect(
    findFreeNumerals('8.489 download, 1,5 secondi, 157/157 commit, 30% e 10k+'),
  ).toEqual(['8.489', '1,5', '157', '157', '30', '10'])
})

test('years from 1990 to 2099 are allowed', () => {
  expect(findFreeNumerals('Dal 1990 al 2023–2026, fino al 2099.')).toEqual([])
})

test('four-digit numbers outside the year range are free numerals', () => {
  expect(findFreeNumerals('Nel 1989 e nel 2100, 1234 utenti.')).toEqual([
    '1989',
    '2100',
    '1234',
  ])
})

test('a metric reference is not a free numeral', () => {
  expect(findFreeNumerals('{{m:sdk-commits}} commit e {{m:top10}}')).toEqual([])
})

test('known technical names with digits are not figures', () => {
  expect(
    findFreeNumerals(
      'i18n, a11y, OAuth2, ES2015, Cloudflare R2, V8, v8.4, scena 3D',
    ),
  ).toEqual([])
})

test('a year with a unit, a magnitude or a percent glued to it is a figure', () => {
  expect(findFreeNumerals('2000k, 1999M, 2050x e 2024%')).toEqual([
    '2000',
    '1999',
    '2050',
    '2024',
  ])
})

test('a figure glued to a word or a mark is still a figure', () => {
  expect(
    findFreeNumerals(
      'Esperienza.10 anni, React,5 anni, _500_ utenti, x10 faster',
    ),
  ).toEqual(['10', '5', '500', '10'])
})

test('digits of any script, superscripts and numeral letters are figures', () => {
  expect(findFreeNumerals('٣٠٠ utenti, ３００ utenti, m² e Ⅻ')).toEqual([
    '٣٠٠',
    '３００',
    '²',
    'Ⅻ',
  ])
})

test('a figure next to a metric reference is still found', () => {
  expect(findFreeNumerals('{{m:sdk-commits}}+5 commit')).toEqual(['5'])
})
