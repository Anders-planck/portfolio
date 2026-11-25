import { createFileRoute, notFound } from '@tanstack/react-router'

// Any address no page claims ends here, so the 404 shows through the router's
// public not-found state; page routes always outrank this splat.
export const Route = createFileRoute('/{-$locale}/$')({
  beforeLoad: () => {
    notFound({ throw: true })
  },
})
