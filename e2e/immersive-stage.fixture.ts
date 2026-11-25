import { expect, type Page } from '@playwright/test'

/** The engine demo page (ticket 07), Italian. */
export const DEMO_PATH = '/demo'
export const WIDE = { width: 1280, height: 720 }
export const NARROW = { width: 390, height: 844 }

/** The Block: present only in the immersive layout, once hydrated. */
export function findBlock(page: Page) {
  return page.getByRole('slider', { name: 'Blocco' })
}

export function findChapterIndex(page: Page) {
  return page.getByRole('list', { name: 'Capitoli' })
}

/** The step of the chapter index marked as the chapter on screen. */
export function findActiveStep(page: Page) {
  return findChapterIndex(page).locator('[aria-current="step"]')
}

/** Opens the demo at 1280×720 and waits for the immersive layout. */
export async function openImmersiveDemo(page: Page, path = DEMO_PATH) {
  await page.setViewportSize(WIDE)
  await page.goto(path)
  await expect(findBlock(page)).toBeVisible()
}
