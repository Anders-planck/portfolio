import { createFileRoute } from '@tanstack/react-router'

import { HelloPage, helloQueryOptions } from '../../pages/hello/hello-page'
import { toPageHead } from '../../widgets/site-shell/to-page-head'

export const Route = createFileRoute('/{-$locale}/')({
  // Awaiting in the loader renders the Convex data on the server.
  loader: ({ context }) =>
    context.queryClient.query({ ...helloQueryOptions, staleTime: 'static' }),
  head: ({ match }) =>
    toPageHead(match.pathname, ({ site }) => ({
      title: site.name,
      description: site.description,
    })),
  component: HelloPage,
})
