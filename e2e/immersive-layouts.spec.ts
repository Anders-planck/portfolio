import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import {
  DEMO_PATH,
  findBlock,
  findChapterIndex,
  NARROW,
  openImmersiveDemo,
  WIDE,
} from './immersive-stage.fixture'

const CHAPTER_IDS = [
  'apertura',
  'scorrimento',
  'puntatore',
  'ancore',
  'impaginazione',
]

interface Box {
  name: string
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * The boxes on screen while `chapterId` is pinned: its text, the Block, the
 * chapter navigation, the hint under it and the chapter index.
 */
function readSceneBoxes(page: Page, chapterId: string): Promise<Box[]> {
  return page.evaluate((id) => {
    const toBox = (name: string, element: Element | null | undefined) => {
      const rect = element?.getBoundingClientRect()
      return {
        name,
        top: rect?.top ?? Number.NaN,
        bottom: rect?.bottom ?? Number.NaN,
        left: rect?.left ?? Number.NaN,
        right: rect?.right ?? Number.NaN,
      }
    }
    const navigation = document.querySelector(
      '[role="group"][aria-label="Capitolo"]',
    )
    return [
      toBox(
        'chapter text',
        document.getElementById(id)?.firstElementChild?.firstElementChild,
      ),
      toBox('block', document.querySelector('[role="slider"]')),
      toBox('chapter navigation', navigation),
      toBox('hint', navigation?.nextElementSibling),
      toBox(
        'chapter index',
        document.querySelector('ol[aria-label="Capitoli"]'),
      ),
    ]
  }, chapterId)
}

function overlaps(first: Box, second: Box): boolean {
  return (
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom
  )
}

test('at 1280×720 nothing overlaps and the scene stays on screen', async ({
  page,
}) => {
  await openImmersiveDemo(page)
  const headerBottom =
    (await page.getByRole('banner').boundingBox())?.height ?? 0
  for (const chapterId of CHAPTER_IDS) {
    await page.evaluate((id) => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }, chapterId)
    const boxes = await readSceneBoxes(page, chapterId)
    boxes.forEach((box) => {
      expect(box.top, `${box.name} in ${chapterId}`).toBeGreaterThanOrEqual(
        headerBottom,
      )
      expect(box.bottom, `${box.name} in ${chapterId}`).toBeLessThanOrEqual(
        WIDE.height,
      )
    })
    const overlapping = boxes.flatMap((box, index) =>
      boxes
        .slice(index + 1)
        .filter((other) => overlaps(box, other))
        .map((other) => `${box.name} × ${other.name}`),
    )
    expect(overlapping, chapterId).toEqual([])
  }
})

test('the immersive layout has no axe violations', async ({ page }) => {
  await openImmersiveDemo(page)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('a narrow screen gets the linear layout, with no axe violations', async ({
  page,
}) => {
  await page.setViewportSize(NARROW)
  await page.goto(DEMO_PATH)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Demo del motore immersivo' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4)
  await expect(findBlock(page)).toHaveCount(0)
  await expect(findChapterIndex(page)).toHaveCount(0)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('a wide screen gets the linear layout and a still Block', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto(`${DEMO_PATH}#impaginazione`)
    await expect(
      page.getByRole('heading', { name: 'Lineare quando serve' }),
    ).toBeInViewport()
    await expect(findBlock(page)).toHaveCount(0)
    await expect(findChapterIndex(page)).toHaveCount(0)
    for (const chapterId of CHAPTER_IDS) {
      await expect(page.locator(`section#${chapterId}`)).toHaveCount(1)
    }
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
