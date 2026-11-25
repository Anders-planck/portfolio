import type { RedirectRule } from './redirect-rule'

export interface RedirectTarget {
  pathname: string
  statusCode: RedirectRule['statusCode']
}

/** Path segments without the empty ones a leading or trailing slash leaves. */
function toSegments(pathname: string): string[] {
  return pathname.split('/').filter((segment) => segment !== '')
}

function isParamSegment(segment: string): boolean {
  return segment.startsWith(':')
}

/** The `:name` values of `pathname`, or undefined when `from` does not match. */
function matchRule(
  from: string,
  pathname: string,
): Map<string, string> | undefined {
  const patternSegments = toSegments(from)
  const pathSegments = toSegments(pathname)
  if (patternSegments.length !== pathSegments.length) {
    return undefined
  }
  const isMatch = patternSegments.every(
    (patternSegment, index) =>
      isParamSegment(patternSegment) || patternSegment === pathSegments[index],
  )
  if (!isMatch) {
    return undefined
  }
  return new Map(
    patternSegments.flatMap((patternSegment, index): [string, string][] =>
      isParamSegment(patternSegment)
        ? [[patternSegment, pathSegments[index] ?? '']]
        : [],
    ),
  )
}

/** The `to` of a rule with the matched `:name` values filled in. */
function toTargetPathname(to: string, params: Map<string, string>): string {
  const targetSegments = toSegments(to).map((segment) =>
    isParamSegment(segment) ? (params.get(segment) ?? segment) : segment,
  )
  return `/${targetSegments.join('/')}`
}

/** Where the first rule matching `pathname` sends it, if any rule does. */
export function findRedirect(
  pathname: string,
  rules: readonly RedirectRule[],
): RedirectTarget | undefined {
  const [target] = rules.flatMap((rule) => {
    const params = matchRule(rule.from, pathname)
    return params === undefined
      ? []
      : [
          {
            pathname: toTargetPathname(rule.to, params),
            statusCode: rule.statusCode,
          },
        ]
  })
  return target
}
