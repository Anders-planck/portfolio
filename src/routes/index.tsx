import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'

const helloQuery = convexQuery(api.hello.get, {})

export const Route = createFileRoute('/')({
  // Awaiting in the loader renders the Convex data on the server.
  loader: ({ context }) => context.queryClient.ensureQueryData(helloQuery),
  component: HelloPage,
})

function HelloPage() {
  const { data } = useSuspenseQuery(helloQuery)

  return (
    <Layout
      content={
        <LayoutContent role="main" padding={8}>
          <Heading level={1}>{data.message}</Heading>
        </LayoutContent>
      }
    />
  )
}
