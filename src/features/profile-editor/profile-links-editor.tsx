import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'

import type { ProfileLink } from '../../entities/profile/profile-draft'
import { CMS_MESSAGES } from '../../shared/i18n/cms-messages'

const { links: copy } = CMS_MESSAGES.profile

/**
 * The social links of the Profile, in the order the site shows them. Every
 * row moves up and down with buttons, so reordering works by keyboard
 * (resolution 18). Each change hands back the whole list.
 */
export function ProfileLinksEditor({
  links,
  onChange,
}: {
  links: ProfileLink[]
  onChange: (links: ProfileLink[]) => void
}) {
  const replaceLink = (index: number, link: ProfileLink) => {
    onChange(links.map((current, at) => (at === index ? link : current)))
  }
  const moveLink = (from: number, to: number) => {
    const moved = links.filter((_, at) => at !== from)
    const link = links[from]
    if (link === undefined) {
      return
    }
    onChange([...moved.slice(0, to), link, ...moved.slice(to)])
  }

  return (
    <VStack gap={3}>
      <Heading level={3}>{copy.title}</Heading>
      {links.length === 0 && <Text type="body">{copy.empty}</Text>}
      {links.map((link, index) => {
        const name = link.label === '' ? copy.untitled : link.label
        return (
          // Rows have no id of their own; the position is the identity.
          <HStack key={index} gap={2} align="end">
            <TextInput
              label={copy.label}
              value={link.label}
              onChange={(label) => {
                replaceLink(index, { ...link, label })
              }}
            />
            <TextInput
              type="url"
              label={copy.href}
              value={link.href}
              onChange={(href) => {
                replaceLink(index, { ...link, href })
              }}
            />
            <Button
              size="sm"
              label={copy.moveUp(name)}
              isDisabled={index === 0}
              onClick={() => {
                moveLink(index, index - 1)
              }}
            />
            <Button
              size="sm"
              label={copy.moveDown(name)}
              isDisabled={index === links.length - 1}
              onClick={() => {
                moveLink(index, index + 1)
              }}
            />
            <Button
              size="sm"
              variant="destructive"
              label={copy.remove(name)}
              onClick={() => {
                onChange(links.filter((_, at) => at !== index))
              }}
            />
          </HStack>
        )
      })}
      <Button
        label={copy.add}
        onClick={() => {
          onChange([...links, { label: '', href: '' }])
        }}
      />
    </VStack>
  )
}
