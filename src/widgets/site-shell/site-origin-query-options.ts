import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

import { readSiteOriginSetting } from '../../shared/config/env'
import { toSiteOrigin } from './site-origin'

/**
 * Reads the Worker's `SITE_ORIGIN` and the request origin. On the server
 * only: the browser never sees the setting, just the answer.
 */
const getSiteOrigin = createServerFn({ method: 'GET' }).handler(() =>
  toSiteOrigin({
    configuredOrigin: readSiteOriginSetting(),
    requestOrigin: getRequestUrl().origin,
  }),
)

/** Asked once per visit: the root loader fills it on the server. */
export function siteOriginQueryOptions() {
  return queryOptions({
    queryKey: ['site-origin'],
    queryFn: () => getSiteOrigin(),
    staleTime: 'static',
  })
}
