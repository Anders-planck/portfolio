import { createFileRoute } from '@tanstack/react-router'

import { HomePage, homeProfileQueryOptions } from '../pages/home/home-page'

export const Route = createFileRoute('/')({
  // Awaiting in the loader renders the published profile on the server.
  loader: ({ context }) =>
    context.queryClient.query({
      ...homeProfileQueryOptions,
      staleTime: 'static',
    }),
  component: HomePage,
})
