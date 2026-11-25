import { z } from 'zod'

import type { SourceReading } from './attempts'
import { fetchJson } from './http'
import type { Source } from './sources'

const NPM_DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point/last-year'

const npmDownloadsSchema = z.object({
  downloads: z.number().int().nonnegative(),
})

/** Downloads of one package in the last year (npm downloads API, no token). */
export async function readNpmDownloads(
  source: Extract<Source, { kind: 'npm' }>,
): Promise<SourceReading> {
  const response = await fetchJson(
    `${NPM_DOWNLOADS_URL}/${source.packageName}`,
    { Accept: 'application/json' },
    npmDownloadsSchema,
  )
  if (response.kind === 'failed') {
    return response
  }
  return { kind: 'ok', figure: { value: response.body.downloads, total: null } }
}
