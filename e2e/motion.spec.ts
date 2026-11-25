import { expect, type Page, test } from '@playwright/test'

const CURSOR_RING = '[data-cursor-ring]'

/** The CV button in the header: the magnetic control of every page. */
function findCvButton(page: Page) {
  return page.getByRole('banner').getByRole('link', { name: 'CV · PDF' })
}

/**
 * How visible the footer wordmark is: the product of its own and its
 * ancestors' opacity, since a reveal fades the block around it.
 */
function readFooterOpacity(page: Page) {
  return page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'anders/planck' })
    .locator('xpath=ancestor-or-self::*')
    .evaluateAll((chain) =>
      chain.reduce(
        (opacity, element) =>
          opacity * Number(getComputedStyle(element).opacity),
        1,
      ),
    )
}

/** Moves the mouse a little off the centre of the CV button. */
async function hoverNearCvButton(page: Page) {
  const box = await findCvButton(page).boundingBox()
  expect(box).not.toBeNull()
  if (box !== null) {
    await page.mouse.move(box.x + box.width / 2 + 12, box.y + box.height / 2)
  }
}

test.describe('with a mouse and motion allowed', () => {
  test('the custom cursor follows the pointer and grows over links', async ({
    page,
  }) => {
    await page.goto('/')
    await hoverNearCvButton(page)
    const ring = page.locator(CURSOR_RING)
    await expect(ring).toHaveAttribute('data-active', '')
    await expect(ring).toHaveAttribute('data-link', '')
    await expect(page.locator('body')).toHaveAttribute('data-custom-cursor', '')
  })

  test('an open menu gets the system cursor back, and loses it once closed', async ({
    page,
  }) => {
    await page.goto('/')
    await hoverNearCvButton(page)
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-custom-cursor', '')

    const menuButton = page
      .getByRole('banner')
      .getByRole('button', { name: 'Lingua: IT' })
    await menuButton.click()
    const english = page.getByRole('menuitemradio', { name: 'English' })
    await english.hover()
    await expect(body).not.toHaveAttribute('data-custom-cursor')
    await expect(english).not.toHaveCSS('cursor', 'none')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('menuitemradio')).toHaveCount(0)
    await hoverNearCvButton(page)
    await expect(body).toHaveAttribute('data-custom-cursor', '')
  })

  test('a text field keeps the native I-beam', async ({ page }) => {
    await page.goto('/')
    await hoverNearCvButton(page)
    await expect(page.locator('body')).toHaveAttribute('data-custom-cursor', '')
    // No page has a field yet; one is added the way a page would render it.
    await page.evaluate(() => {
      const field = document.createElement('input')
      field.setAttribute('aria-label', 'campo')
      field.style.position = 'fixed'
      field.style.top = '50%'
      field.style.left = '50%'
      document.body.append(field)
    })
    const field = page.getByRole('textbox', { name: 'campo' })
    await field.hover()
    await expect(page.locator('body')).not.toHaveAttribute('data-custom-cursor')
    await expect(field).toHaveCSS('cursor', 'text')
  })

  test('the CV button leans toward a pointer near it', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(CURSOR_RING)).toHaveCount(1)
    await hoverNearCvButton(page)
    await expect(findCvButton(page)).toHaveCSS(
      'transform',
      /^matrix\(1, 0, 0, 1, [1-9]/,
    )
  })

  test('a block below the fold fades in when it scrolls into view', async ({
    page,
  }) => {
    // So short that the footer starts below the fold.
    await page.setViewportSize({ width: 1280, height: 120 })
    await page.goto('/')
    await expect(page.locator(CURSOR_RING)).toHaveCount(1)
    await expect.poll(() => readFooterOpacity(page)).toBe(0)
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await expect.poll(() => readFooterOpacity(page)).toBe(1)
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing moves and the system cursor stays', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 120 })
    await page.goto('/')
    await hoverNearCvButton(page)

    await expect(page.locator(CURSOR_RING)).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveAttribute('data-custom-cursor')
    await expect(findCvButton(page)).toHaveCSS('cursor', 'pointer')
    await expect(findCvButton(page)).toHaveCSS(
      'transform',
      /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
    )
    expect(await readFooterOpacity(page)).toBe(1)
  })
})

test.describe('on a touch screen', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })

  test('there is no custom cursor', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.locator(CURSOR_RING)).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveAttribute('data-custom-cursor')
  })
})
