import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { test } from './cms-test'

// Publishing changes what Home shows, so these tests run one after another.
test.describe.configure({ mode: 'serial' })

/** The contact link text is on Home and no other test checks it. */
const CONTACT_LABEL = 'Testo del pulsante di contatto'

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

test('the owner edits the Profile, it saves itself, and publishing puts it on Home', async ({
  ownerPage,
}) => {
  await openProfileEditor(ownerPage)
  const originalLabel = await ownerPage.getByLabel(CONTACT_LABEL).inputValue()
  const editedLabel = `Scrivimi ${String(Date.now())}`

  await publishContactLabel(ownerPage, editedLabel)
  await ownerPage.goto('/')
  await expect(ownerPage.getByRole('link', { name: editedLabel })).toBeVisible()

  // Put Home back as the seed published it.
  await openProfileEditor(ownerPage)
  await publishContactLabel(ownerPage, originalLabel)
})

test('a draft edit stays off Home until it is published', async ({
  ownerPage,
}) => {
  await openProfileEditor(ownerPage)
  const originalLabel = await ownerPage.getByLabel(CONTACT_LABEL).inputValue()
  const draftLabel = `Bozza ${String(Date.now())}`

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
