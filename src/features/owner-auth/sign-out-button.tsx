import { Button } from '@astryxdesign/core/Button'
import { useAuthActions } from '@convex-dev/auth/react'

import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

/** Ends the owner's session; the CMS then shows Accesso again. */
export function SignOutButton() {
  const { signOut } = useAuthActions()
  return (
    <Button
      variant="ghost"
      label={CMS_MESSAGES.access.signOut}
      clickAction={async () => {
        await signOut()
      }}
    />
  )
}
