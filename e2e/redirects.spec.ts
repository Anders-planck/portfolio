import { type APIRequestContext, expect, test } from '@playwright/test'

/** Where the server sends `path`, without following it. */
async function readRedirect(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 })
  const location = response.headers().location ?? ''
  return {
    status: response.status(),
    pathname: new URL(location, 'http://site.test').pathname,
    location,
  }
}

for (const [path, target] of [
  ['/projects/bussola', '/lavori/bussola'],
  ['/en/projects/bussola', '/en/lavori/bussola'],
  // One hop for the Italian prefix and the rule together.
  ['/it/projects/bussola', '/lavori/bussola'],
  ['/it/lavori', '/lavori'],
] as const) {
  test(`${path} moves for good to ${target} in one hop`, async ({
    request,
  }) => {
    expect(await readRedirect(request, path)).toMatchObject({
      status: 301,
      pathname: target,
    })
  })
}

test('an old project address keeps its query string', async ({ request }) => {
  const { status, location } = await readRedirect(
    request,
    '/projects/bussola?ref=cv',
  )
  expect(status).toBe(301)
  expect(location).toMatch(/\/lavori\/bussola\?ref=cv$/)
})

// The router itself first normalises repeated slashes and a trailing slash
// (307), before any route loads; the root then moves the result (301).
test('a trailing slash goes', async ({ request }) => {
  expect(await readRedirect(request, '/lavori/')).toMatchObject({
    status: 307,
    pathname: '/lavori',
  })
})

for (const path of ['/it//evil.com', '/it/\\evil.com', '/it/%5Cevil.com']) {
  test(`${path} never sends the reader to another site`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    expect(new URL(page.url()).hostname).toBe('localhost')
    expect(new URL(page.url()).pathname).toBe('/evil.com')
  })
}

test('a redirect followed in the browser lands on the new address', async ({
  page,
}) => {
  await page.goto('/projects/bussola')
  await expect(page).toHaveURL(/\/lavori\/bussola$/)
})
