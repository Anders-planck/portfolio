import { expect, type Page, test } from '@playwright/test'

/** Picks a language from the header menu, by its own name. */
async function switchLanguage(page: Page, languageName: string) {
  await page
    .getByRole('banner')
    .getByRole('button', { name: /^(Lingua|Language|Langue|Sprache):/ })
    .click()
  await page.getByRole('menuitemradio', { name: languageName }).click()
}

test('switching language keeps the page and changes the shell copy', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'it')
  await expect(page.getByRole('link', { name: 'Lavori' }).first()).toBeVisible()

  await switchLanguage(page, 'English')
  await expect(page).toHaveURL(/\/en$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('link', { name: 'Work' }).first()).toBeVisible()

  await switchLanguage(page, 'Italiano')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'it')
})

test('switching language on an inner page stays on it, query and anchor kept', async ({
  page,
}) => {
  await page.goto('/en/lavori?vista=lista#capitolo')
  await switchLanguage(page, 'Deutsch')
  await expect(page).toHaveURL(/\/de\/lavori\?vista=lista#capitolo$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
})

test('on a slow network the page never blanks while the language changes', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('banner')).toBeVisible()
  // Records any moment the header leaves the document during the switch.
  await page.evaluate(() => {
    new MutationObserver(() => {
      if (document.querySelector('header, [role="banner"]') === null) {
        Reflect.set(window, 'hasLostShell', true)
      }
    }).observe(document, { childList: true, subtree: true })
  })
  // Every script and catalog loaded from now on arrives late.
  await page.route('**/assets/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.continue()
  })

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Lingua: IT' })
    .click()
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(
    page.getByRole('link', { name: 'Projekte' }).first(),
  ).toBeVisible()
  expect(
    await page.evaluate(() => Reflect.get(window, 'hasLostShell') === true),
  ).toBe(false)
})

test('the language menu marks the current language and closes on Escape', async ({
  page,
}) => {
  await page.goto('/fr')
  const trigger = page
    .getByRole('banner')
    .getByRole('button', { name: 'Langue: FR' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('menuitemradio', { name: 'Français' }),
  ).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menuitemradio')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
