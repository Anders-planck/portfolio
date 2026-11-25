/**
 * A permanent or temporary move of an old address to a new one. `from` and
 * `to` are paths; a `:name` segment in `from` matches any one segment and
 * fills the same `:name` in `to`. Same shape as the `redirects` table the
 * CMS will edit (ticket 16), which then replaces the fixed list.
 */
export interface RedirectRule {
  from: string
  to: string
  statusCode: 301 | 302 | 307 | 308
}

/** The v2 project pages moved under Lavori (ADR 0001). */
export const FIXED_REDIRECT_RULES: readonly RedirectRule[] = [
  { from: '/projects/:slug', to: '/lavori/:slug', statusCode: 301 },
]
