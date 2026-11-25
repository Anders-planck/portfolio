import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { VStack } from '@astryxdesign/core/Stack'
import { useSignInWithGithub } from '@convex-dev/auth/methods/github/react'
import { useState } from 'react'

import { api } from '../../../convex/_generated/api'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

/**
 * Starts the GitHub sign-in; GitHub sends the owner back to this page, where
 * the auth provider finishes it. `clickAction` keeps the button busy until
 * the browser leaves, so a double click starts one flow. A flow that cannot
 * start (the backend refused it) is reported here, since nothing navigates.
 */
export function SignInWithGithubButton() {
  const { signIn } = useSignInWithGithub(api.auth)
  const [hasStartFailed, setHasStartFailed] = useState(false)
  return (
    <VStack gap={3}>
      <Button
        variant="primary"
        label={CMS_MESSAGES.access.signInWithGithub}
        clickAction={async () => {
          const started = await signIn()
          setHasStartFailed(started.status === 'error')
        }}
      />
      {hasStartFailed && (
        <Banner status="error" title={CMS_MESSAGES.access.failedTitle} />
      )}
    </VStack>
  )
}
