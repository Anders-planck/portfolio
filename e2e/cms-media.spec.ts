import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

import { test } from './cms-test'

// Runs before the other specs (playwright.config.ts): it publishes the CV the
// header's CV button needs. The backend's bucket is the fake R2 server.
test.describe.configure({ mode: 'serial' })

/** A name no earlier run used; letters only (numerals are free numbers). */
function createUniqueWord() {
  return Date.now()
    .toString()
    .replace(/\d/g, (numeral) => 'abcdefghij'.charAt(Number(numeral)))
}

/**
 * A small JPEG with an EXIF block (APP1, `Exif\0\0`) right after its start
 * marker, as a phone photo has: drawn and encoded by the browser itself.
 */
async function createJpegWithExif(page: Page) {
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 40
    canvas.height = 30
    const context = canvas.getContext('2d')
    if (context === null) {
      throw new Error('No 2D canvas')
    }
    context.fillStyle = 'teal'
    context.fillRect(0, 0, 40, 30)
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg')
    })
    if (blob === null) {
      throw new Error('No JPEG')
    }
    const jpeg = new Uint8Array(await blob.arrayBuffer())
    const payload = new TextEncoder().encode('Exif\0\0GPS-secret-place')
    const segmentLength = payload.length + 2
    const app1 = [0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff]
    return [...jpeg.slice(0, 2), ...app1, ...payload, ...jpeg.slice(2)]
  })
  return Buffer.from(bytes)
}

async function uploadFile(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  // Through the picker, as the owner does: the field's visible area opens it.
  const fileChooser = page.waitForEvent('filechooser')
  await page.getByText('Scegli un file').click()
  await (await fileChooser).setFiles(file)
  await expect(page.getByText(`${file.name} caricato.`)).toBeVisible()
}

test('the owner uploads an image without its EXIF and writes its alt', async ({
  ownerPage,
}) => {
  await ownerPage.goto('/cms/media')
  await expect(
    ownerPage.getByRole('heading', { level: 1, name: 'Media' }),
  ).toBeVisible()
  const fileName = `schermata-${createUniqueWord()}.jpg`

  await uploadFile(ownerPage, {
    name: fileName,
    mimeType: 'image/jpeg',
    buffer: await createJpegWithExif(ownerPage),
  })

  const href = await ownerPage
    .getByRole('link', { name: fileName })
    .getAttribute('href')
  expect(href).not.toBeNull()
  const stored = await ownerPage.request.get(href ?? '')
  expect(stored.headers()['content-type']).toBe('image/jpeg')
  const storedBytes = await stored.body()
  expect(storedBytes.includes('Exif')).toBe(false)
  expect(storedBytes.includes('GPS-secret-place')).toBe(false)

  await ownerPage
    .getByRole('button', { name: `Testo alternativo di ${fileName}` })
    .click()
  const italianAlt = ownerPage.getByRole('textbox', { name: 'Alt · Italiano' })
  await italianAlt.fill('Un rettangolo verde acqua')
  await italianAlt.blur()
  await expect(
    ownerPage.getByRole('dialog').getByText('Salvato', { exact: true }).first(),
  ).toBeVisible()
  expect(
    (await new AxeBuilder({ page: ownerPage }).analyze()).violations,
  ).toEqual([])
  await ownerPage.getByRole('button', { name: 'Chiudi' }).click()
  await expect(ownerPage.getByText('manca: EN, FR, DE').first()).toBeVisible()
})

test('a CV uploaded in Media and chosen in Profilo is the site’s CV button', async ({
  ownerPage,
}) => {
  const fileName = `cv-${createUniqueWord()}.pdf`
  await ownerPage.goto('/cms/media')
  await uploadFile(ownerPage, {
    name: fileName,
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n%%EOF\n'),
  })
  const cvHref = await ownerPage
    .getByRole('link', { name: fileName })
    .getAttribute('href')

  await ownerPage.goto('/cms/profilo')
  await ownerPage.getByRole('combobox', { name: 'CV' }).click()
  await ownerPage.getByRole('option', { name: fileName }).click()
  await expect(
    ownerPage.getByRole('status').filter({ hasText: 'Salvato ·' }),
  ).toBeVisible()
  await ownerPage.getByRole('button', { name: 'Pubblica' }).click()
  await expect(
    ownerPage.getByText('Pubblicato: il sito mostra la bozza.'),
  ).toBeVisible()

  await ownerPage.goto('/')
  const cvButton = ownerPage
    .getByRole('banner')
    .getByRole('link', { name: 'CV · PDF' })
  await expect(cvButton).toHaveAttribute('href', cvHref ?? '')
  const cv = await ownerPage.request.get(cvHref ?? '')
  expect(cv.headers()['content-type']).toBe('application/pdf')

  await ownerPage.goto('/cms/media')
  await expect(
    ownerPage.getByText('Profilo · CV · pubblicato').first(),
  ).toBeVisible()
})
