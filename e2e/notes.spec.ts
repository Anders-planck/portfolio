import { execFileSync } from 'node:child_process'

import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { test } from './cms-test'

const SEED_TITLE = 'Cosa cerco quando rivedo il codice di un agente'
const SEED_PATH = '/note/review-agenti'

/** Layouts every public page is checked in (resolution 7: linear below 1024px). */
const LAYOUTS = [
  { name: 'wide', viewport: { width: 1280, height: 720 } },
  { name: 'phone', viewport: { width: 375, height: 812 } },
] as const

test.beforeAll(() => {
  // The seed note is the mockup's published note; publishing it is idempotent.
  execFileSync('bunx', ['convex', 'run', 'seed:publishSeedNote'], {
    stdio: 'pipe',
  })
})

/** A word no earlier run used. Letters only: numerals are free numbers (ADR 0004). */
function createUniqueWord() {
  return Date.now()
    .toString()
    .replace(/\d/g, (numeral) => 'abcdefghij'.charAt(Number(numeral)))
}

async function expectNoAxeViolations(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
}

for (const { name, viewport } of LAYOUTS) {
  test(`Note lists published notes with topic counts, no axe violations (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/note')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Note' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(SEED_TITLE) }),
    ).toBeVisible()
    await expect(page.getByRole('radio', { name: /^AI · / })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test(`Nota has an Outline, a reading ProgressBar, no axe violations (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(SEED_PATH)

    await expect(
      page.getByRole('heading', { level: 1, name: SEED_TITLE }),
    ).toBeVisible()
    const outline = page.getByRole('navigation', { name: 'In questa nota' })
    await expect(
      outline.getByRole('link', { name: 'Errori di architettura' }),
    ).toBeVisible()
    const progress = page.getByRole('progressbar', {
      name: 'Avanzamento della lettura',
    })
    await expect(progress).toHaveAttribute('aria-valuenow', '0')
    await expectNoAxeViolations(page)

    await page.mouse.wheel(0, 100_000)
    await expect(progress).toHaveAttribute('aria-valuenow', '100')
  })
}

test('Nota is server-rendered with its title and SEO head', async ({
  request,
}) => {
  const html = await (await request.get(SEED_PATH)).text()
  const head = html.slice(0, html.indexOf('</head>'))

  expect(head).toContain(`<title>${SEED_TITLE} · Anders Planck</title>`)
  expect(head).toContain('Cinque errori tipici degli agenti')
  expect(html).toContain('id="errori-di-architettura"')
})

test('a note in an untranslated locale falls back to Italian with a notice', async ({
  page,
}) => {
  await page.goto(`/en${SEED_PATH}`)

  await expect(
    page.getByText(
      'This page is not translated yet: you are reading it in Italiano.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: SEED_TITLE }),
  ).toBeVisible()
})

test('an unknown note slug is the 404 page', async ({ page }) => {
  const response = await page.goto('/note/nessuna-nota-qui')

  expect(response?.status()).toBe(404)
})

test('the owner writes a note, it saves itself, and publishing puts it on Note', async ({
  ownerPage,
}) => {
  const word = createUniqueWord()
  const title = `Nota di prova ${word}`
  await ownerPage.goto('/cms/note')
  await ownerPage.getByRole('button', { name: 'Nuova nota' }).click()

  await ownerPage.getByLabel('Titolo').fill(title)
  await ownerPage.getByLabel('Sintesi').fill('Una prova dal browser.')
  await ownerPage
    .getByLabel('Testo in Markdown')
    .fill(
      '## Primo passo\n\nTesto **forte**.\n\n:::case{title="Il caso"}\nDentro.\n:::',
    )
  await ownerPage.getByLabel('Slug', { exact: true }).fill(`prova-${word}`)
  await expect(
    ownerPage.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()
  await expect(
    ownerPage.getByText('Nessun problema: la nota si può pubblicare.'),
  ).toBeVisible()
  await ownerPage.getByRole('button', { name: 'Pubblica ora' }).click()
  await expect(
    ownerPage.getByText('Pubblicato: il sito mostra la bozza.'),
  ).toBeVisible()

  await ownerPage.goto('/note')
  await ownerPage.getByRole('link', { name: new RegExp(title) }).click()
  await expect(
    ownerPage.getByRole('heading', { level: 1, name: title }),
  ).toBeVisible()
  await expect(
    ownerPage
      .getByRole('navigation', { name: 'In questa nota' })
      .getByRole('link', { name: 'Il caso' }),
  ).toBeVisible()
})

test('a free number in a note blocks the publish and the editor says why', async ({
  ownerPage,
}) => {
  await ownerPage.goto('/cms/note')
  await ownerPage.getByRole('button', { name: 'Nuova nota' }).click()

  await ownerPage.getByLabel('Titolo').fill(`Numeri ${createUniqueWord()}`)
  await ownerPage.getByLabel('Testo in Markdown').fill('Ho trovato 3 buchi.')
  await ownerPage
    .getByLabel('Slug', { exact: true })
    .fill(`numeri-${createUniqueWord()}`)
  await expect(
    ownerPage.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()

  await expect(
    ownerPage.getByText(
      'C’è un numero scritto a mano: usa un riferimento {{m:chiave}}.',
    ),
  ).toBeVisible()
  await expectNoAxeViolations(ownerPage)
})
