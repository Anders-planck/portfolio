import type { Messages } from '../../shared/i18n/messages'

/** A top-level section of the site, as the header and footer link it. */
export interface SiteSection {
  /** Path without the locale prefix. */
  path: string
  labelKey: keyof Pick<Messages['navigation'], 'work' | 'notes' | 'careerPath'>
}

/** Lavori: the 404 page sends readers there too. */
export const WORK_PATH = '/lavori'

/**
 * Lavori, Note, Percorso (resolution 1). Fixed until navigation is edited
 * in the CMS (ticket 16, #25).
 */
export const SITE_SECTIONS: readonly SiteSection[] = [
  { path: WORK_PATH, labelKey: 'work' },
  { path: '/note', labelKey: 'notes' },
  { path: '/percorso', labelKey: 'careerPath' },
]

/** Whether the page on screen is the section or one of its pages. */
export function isInSection(
  unprefixedPathname: string,
  sectionPath: string,
): boolean {
  return (
    unprefixedPathname === sectionPath ||
    unprefixedPathname.startsWith(`${sectionPath}/`)
  )
}
