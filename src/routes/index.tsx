import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
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
          <Text as="h1" type="large">
            {data.message}
          </Text>
        </LayoutContent>
      }
    />
  )
}
