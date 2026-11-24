import { createFileRoute } from '@tanstack/react-router'

import { HelloPage, helloQueryOptions } from '../pages/hello/hello-page'

export const Route = createFileRoute('/')({
  // Awaiting in the loader renders the Convex data on the server.
  loader: ({ context }) =>
    context.queryClient.query({ ...helloQueryOptions, staleTime: 'static' }),
  component: HelloPage,
})
