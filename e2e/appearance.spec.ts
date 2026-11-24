import { execFileSync } from 'node:child_process'

import { expect, type Page, test } from '@playwright/test'

// Publishing changes global state, so these tests run one after another and
// put the defaults back at the end.
test.describe.configure({ mode: 'serial' })

const LIGHT_APPEARANCE = {
  theme: {
    basePx: 16,
    ratio: 1.25,
    fonts: { body: 'Figtree', heading: 'Figtree', code: 'ui-monospace' },
    radiusMultiplier: 1,
    mode: 'light',
  },
  motion: { tempo: 1, character: 'standard' },
}

const DARK_APPEARANCE = {
  theme: {
    basePx: 20,
    ratio: 1.333,
    fonts: { body: 'Figtree', heading: 'Georgia', code: 'ui-monospace' },
    radiusMultiplier: 2,
    mode: 'dark',
  },
  motion: { tempo: 1.5, character: 'expressive' },
}

/** Publishes params on the running Convex backend: no rebuild, no restart. */
function publishAppearance(appearance: typeof LIGHT_APPEARANCE) {
  const result = runConvexFunction(
    'appearance:publish',
    JSON.stringify(appearance),
  )
  expect(result).toContain('"published"')
}

/** Runs a Convex function on the deployment `convex dev` wrote to .env.local. */
function runConvexFunction(functionName: string, args = '{}'): string {
  return execFileSync('bunx', ['convex', 'run', functionName, args], {
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

test.afterAll(() => {
  runConvexFunction('appearance:unpublish')
})

/** What the page draws with, read from the browser's computed styles. */
function readRenderedAppearance(page: Page) {
  return page.evaluate(() => {
    const scope = document.querySelector('body [data-astryx-theme]')
    const heading = document.querySelector('h1')
    if (scope === null || heading === null) {
      throw new Error('no theme scope or heading')
    }
    const tokens = getComputedStyle(scope)
    const headingStyle = getComputedStyle(heading)
    const [headingFont = ''] = headingStyle.fontFamily.split(',')
    return {
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      headingFont: headingFont.replaceAll('"', ''),
      headingSize: headingStyle.fontSize,
      radius: tokens.getPropertyValue('--radius-element').trim(),
      durationFast: tokens.getPropertyValue('--duration-fast').trim(),
      tempo: tokens.getPropertyValue('--_astryx-motion-tempo').trim(),
    }
  })
}

test('published params reach the server-rendered HTML', async ({ request }) => {
  publishAppearance(LIGHT_APPEARANCE)
  const before = await (await request.get('/')).text()
  expect(before).toMatch(/<html[^>]* data-theme="light"/)
  expect(before).toContain('--font-family-heading: Figtree, ')

  publishAppearance(DARK_APPEARANCE)
  const after = await (await request.get('/')).text()
  expect(after).toMatch(/<html[^>]* data-theme="dark"/)
  expect(after).toContain('--font-family-heading: Georgia, ')
  expect(after).toContain('--_astryx-motion-tempo: 1.5;')
  // The params' stylesheet comes after the built theme's.
  const head = after.slice(0, after.indexOf('</head>'))
  expect(head.indexOf('<style data-appearance')).toBeGreaterThan(
    head.lastIndexOf('<link rel="stylesheet"'),
  )
})

test('the first paint already has the params, and hydration keeps them', async ({
  browser,
}) => {
  publishAppearance(DARK_APPEARANCE)

  // Without JavaScript the page shows exactly what the server sent: if the
  // params are there, nothing changes them at hydration, so nothing flashes.
  const noJs = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await noJs.newPage()
  await staticPage.goto('/')
  const firstPaint = await readRenderedAppearance(staticPage)
  await noJs.close()
  expect(firstPaint).toEqual({
    colorScheme: 'dark',
    headingFont: 'Georgia',
    headingSize: firstPaint.headingSize,
    radius: '1.25rem',
    durationFast: '188ms',
    tempo: '1.5',
  })

  const context = await browser.newContext()
  const page = await context.newPage()
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  // <Theme> marks <html> with the scheme once React has hydrated.
  await expect(page.locator('html')).toHaveAttribute(
    'data-astryx-scheme',
    'dark',
  )
  expect(await readRenderedAppearance(page)).toEqual(firstPaint)
  expect(errors).toEqual([])
  await context.close()
})

test('a publish restyles an open page without a reload', async ({ page }) => {
  publishAppearance(DARK_APPEARANCE)
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute(
    'data-astryx-scheme',
    'dark',
  )
  const before = await readRenderedAppearance(page)

  publishAppearance(LIGHT_APPEARANCE)
  await expect
    .poll(() => readRenderedAppearance(page))
    .toMatchObject({
      colorScheme: 'light',
      headingFont: 'Figtree',
      radius: '0.625rem',
      durationFast: '125ms',
      tempo: '1',
    })
  const after = await readRenderedAppearance(page)
  // base 20 / ratio 1.333 draws a bigger heading than base 16 / ratio 1.25.
  expect(Number.parseFloat(after.headingSize)).toBeLessThan(
    Number.parseFloat(before.headingSize),
  )
})
