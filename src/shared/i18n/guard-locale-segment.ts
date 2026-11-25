import { notFound } from '@tanstack/react-router'

import { isPrefixedLocale } from './locale'

/**
 * For the `{-$locale}` route's `beforeLoad`: no segment or `en`, `fr`, `de`
 * pass; any other first segment is a page that does not exist.
 */
export function guardLocaleSegment(segment: string | undefined): void {
  if (segment === undefined || isPrefixedLocale(segment)) {
    return
  }
  notFound({ throw: true })
}
