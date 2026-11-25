import { AppShell } from '@astryxdesign/core/AppShell'
import { Banner } from '@astryxdesign/core/Banner'
import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useOauth } from '@convex-dev/auth/methods/github/react'

import { SignInWithGithubButton } from '../../features/owner-auth/sign-in-with-github-button'
import { SignOutButton } from '../../features/owner-auth/sign-out-button'
import {
  type AccessProblem,
  toAccessProblemFromFlowError,
} from '../../features/owner-auth/to-access-problem-from-flow-error'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const PROBLEM_TITLES: Record<AccessProblem, string> = {
  'not-owner': CMS_MESSAGES.access.notOwnerTitle,
  cancelled: CMS_MESSAGES.access.cancelledTitle,
  expired: CMS_MESSAGES.access.expiredTitle,
  failed: CMS_MESSAGES.access.failedTitle,
}

/**
 * Accesso: the only CMS screen before sign-in (resolution 20: "Accedi con
 * GitHub", no repo or branch wording). `isSignedInAsOther` is a session whose
 * account is no longer on the allowlist: it can only sign out.
 */
export function CmsAccessScreen({
  isSignedInAsOther,
}: {
  isSignedInAsOther: boolean
}) {
  const { flowError } = useOauth()
  const problem = isSignedInAsOther
    ? 'not-owner'
    : toAccessProblemFromFlowError(flowError)
  return (
    <AppShell contentPadding={8} variant="surface">
      <Card padding={8} className="mx-auto w-full max-w-xl">
        <VStack gap={4}>
          <Text type="label">{CMS_MESSAGES.brand}</Text>
          <Heading level={1}>{CMS_MESSAGES.access.title}</Heading>
          <Text type="body" as="p">
            {CMS_MESSAGES.access.description}
          </Text>
          {problem !== null && (
            <Banner
              status="error"
              title={PROBLEM_TITLES[problem]}
              {...(problem === 'not-owner'
                ? { description: CMS_MESSAGES.access.notOwnerDescription }
                : {})}
            />
          )}
          {isSignedInAsOther ? <SignOutButton /> : <SignInWithGithubButton />}
        </VStack>
      </Card>
    </AppShell>
  )
}
