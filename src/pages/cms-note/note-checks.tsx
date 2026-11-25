import { Banner } from '@astryxdesign/core/Banner'
import { List, ListItem } from '@astryxdesign/core/List'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'

import type { NoteFinding } from '../../entities/note/note-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const NOTES_COPY = CMS_MESSAGES.notes
const FINDING_COPY: Readonly<Record<string, string>> = NOTES_COPY.findings
const FIELD_COPY: Readonly<Record<string, string>> = NOTES_COPY.findingFields

/**
 * The publish rules on the draft now (the same code publish runs), worded
 * for the owner: what blocks the publish and what only warns.
 */
export function NoteChecks({ findings }: { findings: NoteFinding[] }) {
  if (findings.length === 0) {
    return <Banner status="success" title={NOTES_COPY.editor.checksPassed} />
  }
  return (
    <List density="compact">
      {findings.map((finding, position) => (
        <ListItem
          // Findings are recomputed on every save; their order is stable.
          key={position}
          startContent={
            <StatusDot
              variant={finding.severity === 'block' ? 'error' : 'warning'}
              label={NOTES_COPY.severities[finding.severity]}
            />
          }
          label={
            FINDING_COPY[finding.rule] ?? NOTES_COPY.otherFinding(finding.rule)
          }
          description={
            <Text type="supporting" color="secondary">
              {NOTES_COPY.findingWhere(
                FIELD_COPY[finding.field] ?? finding.field,
                finding.locale === null
                  ? NOTES_COPY.sharedField
                  : CMS_MESSAGES.profile.locales[finding.locale],
              )}
            </Text>
          }
        />
      ))}
    </List>
  )
}
