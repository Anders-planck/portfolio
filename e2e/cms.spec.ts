import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { test } from './cms-test'

// Publishing changes what Home shows, so these tests run one after another.
test.describe.configure({ mode: 'serial' })

/** The contact link text is on Home and no other test checks it. */
const CONTACT_LABEL = 'Testo del pulsante di contatto'

/**
 * A word no earlier run left on Home. Letters only: a numeral would be a
 * free number, which the publish rules block (ADR 0004).
 */
function toUniqueWord() {
  return Date.now()
    .toString()
    .replace(/\d/g, (numeral) => 'abcdefghij'.charAt(Number(numeral)))
}

/**
 * The contact label Home shows now: what the tests put back. Read from the
 * published page, not the draft, so a run that stopped half-way never leaves
 * its own label behind.
 */
async function readPublishedContactLabel(page: Page) {
  await page.goto('/')
  const contactLink = page
    .getByRole('main')
    .locator('a[href^="mailto:"]')
    .first()
  return (await contactLink.textContent())?.trim() ?? ''
}

async function openProfileEditor(page: Page) {
  await page.goto('/cms/profilo')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Profilo' }),
  ).toBeVisible()
}

async function publishContactLabel(page: Page, contactLabel: string) {
  await page.getByLabel(CONTACT_LABEL).fill(contactLabel)
  await expect(
    page.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Pubblica' }).click()
  await expect(
    page.getByText('Pubblicato: il sito mostra la bozza.'),
  ).toBeVisible()
}

test('an anonymous visitor of /cms sees Accesso and nothing else', async ({
  page,
}) => {
  await page.goto('/cms/profilo')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Accedi per modificare il sito',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Accedi con GitHub' }),
  ).toBeVisible()
  await expect(page.getByLabel(CONTACT_LABEL)).toHaveCount(0)
  expect(
    await page.locator('meta[name="robots"]').getAttribute('content'),
  ).toBe('noindex, nofollow')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('the owner lands on Panoramica inside the CMS shell', async ({
  ownerPage,
}) => {
  await ownerPage.goto('/cms')

  await expect(
    ownerPage.getByRole('heading', { level: 1, name: 'Panoramica' }),
  ).toBeVisible()
  for (const group of ['Contenuti', 'Sito', 'Qualità']) {
    await expect(ownerPage.getByText(group, { exact: true })).toBeVisible()
  }
  expect(
    (await new AxeBuilder({ page: ownerPage }).analyze()).violations,
  ).toEqual([])
})

test('the owner opens Fonti from the Qualità group', async ({ ownerPage }) => {
  await ownerPage.goto('/cms')
  await ownerPage.getByRole('link', { name: 'Fonti dei numeri' }).click()

  await expect(
    ownerPage.getByRole('heading', { level: 1, name: 'Fonti dei numeri' }),
  ).toBeVisible()
  await expect(ownerPage).toHaveURL(/\/cms\/fonti$/)
  expect(
    (await new AxeBuilder({ page: ownerPage }).analyze()).violations,
  ).toEqual([])
})

test('the owner edits the Profile, it saves itself, and publishing puts it on Home', async ({
  ownerPage,
}) => {
  const originalLabel = await readPublishedContactLabel(ownerPage)
  await openProfileEditor(ownerPage)
  const editedLabel = `Scrivimi ${toUniqueWord()}`

  await publishContactLabel(ownerPage, editedLabel)
  await ownerPage.goto('/')
  await expect(ownerPage.getByRole('link', { name: editedLabel })).toBeVisible()

  // Put Home back as it was.
  await openProfileEditor(ownerPage)
  await publishContactLabel(ownerPage, originalLabel)
})

test('a draft edit stays off Home until it is published', async ({
  ownerPage,
}) => {
  const originalLabel = await readPublishedContactLabel(ownerPage)
  await openProfileEditor(ownerPage)
  const draftLabel = `Bozza ${toUniqueWord()}`

  await ownerPage.getByLabel(CONTACT_LABEL).fill(draftLabel)
  await expect(
    ownerPage.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()
  await ownerPage.goto('/')
  await expect(
    ownerPage.getByRole('link', { name: originalLabel }),
  ).toBeVisible()

  await openProfileEditor(ownerPage)
  await expect(ownerPage.getByLabel(CONTACT_LABEL)).toHaveValue(draftLabel)
  await ownerPage.getByLabel(CONTACT_LABEL).fill(originalLabel)
  await expect(
    ownerPage.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()
})
