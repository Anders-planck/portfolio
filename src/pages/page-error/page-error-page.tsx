import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { useRouter } from '@tanstack/react-router'

import { useMessages } from '../../shared/i18n/use-messages'

/**
 * What a page shows when its data could not be loaded (Convex unreachable,
 * a chunk that failed): inside the shell, in the locale of the address, with
 * a retry that loads the page again.
 */
export function PageErrorPage() {
  const { pageError } = useMessages()
  const router = useRouter()

  return (
    <Layout height="auto">
      <LayoutContent padding={8}>
        <EmptyState
          title={pageError.title}
          description={pageError.body}
          headingLevel={1}
          actions={
            <Button
              label={pageError.retry}
              variant="primary"
              onClick={() => {
                void router.invalidate()
              }}
            />
          }
        />
      </LayoutContent>
    </Layout>
  )
}
