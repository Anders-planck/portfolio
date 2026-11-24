import { Heading } from '@astryxdesign/core/Heading'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { useSuspenseQuery } from '@tanstack/react-query'

import { api } from '../../../convex/_generated/api'
import { convexQueryOptions } from '../../shared/convex/convex-query-options'

/** Scaffold smoke page: renders the greeting from `hello.get`. */
export const helloQueryOptions = convexQueryOptions(api.hello.get, {})

export function HelloPage() {
  const { data } = useSuspenseQuery(helloQueryOptions)

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
