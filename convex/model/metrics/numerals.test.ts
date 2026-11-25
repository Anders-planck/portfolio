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

test('digits inside a word or a technical name are not figures', () => {
  expect(
    findFreeNumerals('i18n, OAuth2, ES2015, Cloudflare R2, scena 3D'),
  ).toEqual([])
})

test('a figure next to a metric reference is still found', () => {
  expect(findFreeNumerals('{{m:sdk-commits}}+5 commit')).toEqual(['5'])
})
