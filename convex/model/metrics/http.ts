import type { z } from 'zod'

import type { FailureReason } from './attempts'

/**
 * One GET to an external source, its JSON validated with Zod at the boundary
 * (DATA-01). Every way it can go wrong is a typed failure, never a value.
 */
export type JsonResponse<Body> =
  { kind: 'ok'; body: Body } | { kind: 'failed'; reason: FailureReason }

export async function fetchJson<Body>(
  url: string,
  headers: Record<string, string>,
  schema: z.ZodType<Body>,
): Promise<JsonResponse<Body>> {
  let response: Response
  try {
    response = await fetch(url, { headers })
  } catch {
    return { kind: 'failed', reason: { kind: 'network' } }
  }
  if (!response.ok) {
    return { kind: 'failed', reason: { kind: 'http', status: response.status } }
  }
  const json: unknown = await response.json().catch(() => undefined)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return { kind: 'failed', reason: { kind: 'invalid-response' } }
  }
  return { kind: 'ok', body: parsed.data }
}
