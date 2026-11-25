import { createFileRoute } from '@tanstack/react-router'

import { ImmersiveDemoPage } from '../../pages/immersive-demo/immersive-demo-page'
import { toPageHead } from '../../widgets/site-shell/to-page-head'

// The immersive engine demo (ticket 07): placeholder copy, so never indexed
// and never listed in the sitemap.
export const Route = createFileRoute('/{-$locale}/demo')({
  head: ({ match }) =>
    toPageHead(
      match.pathname,
      ({ immersiveDemo }) => ({
        title: immersiveDemo.title,
        description: immersiveDemo.description,
      }),
      { isListed: false },
    ),
  component: ImmersiveDemoPage,
})
