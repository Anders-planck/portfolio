import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

/**
 * The link every Astryx component renders (through `LinkProvider`), so a
 * site address moves through the router instead of reloading the page.
 * Astryx passes `href`; the router's link takes it as `to`, and opens
 * external addresses as plain links.
 */
export function RouterLink({
  href,
  target,
  ...anchorProps
}: Omit<ComponentProps<'a'>, 'href'> & { href: string }) {
  return (
    <Link
      to={href}
      {...anchorProps}
      {...(target === undefined ? {} : { target })}
    />
  )
}
