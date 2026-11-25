import type { Locale } from '../content/locales'
import type { RuleContext } from '../content/rulecontext'
import type { Snapshot } from '../content/snapshot'
import { type MarkdownProblem, parseNoteMarkdown } from './markdown'
import { MAX_NOTES } from './tables'

/**
 * The publish rule of the `note` collection (pure). It blocks a note the
 * site could not show: a bad or taken slug, no Italian title (the source
 * language every locale falls back to), an empty title, a body whose
 * directives do not parse, a metric directive naming no metric. Figures
 * only warn: they render nothing until media exists (ticket 12).
 * Same finding shape as `rules.ts`, without importing it (see `numeralrule.ts`).
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type NoteSnapshot = Extract<Snapshot, { collection: 'note' }>

interface NoteFinding {
  rule: string
  severity: 'block' | 'warn'
  field: string
  locale: Locale | null
  message: string
}

export function noteRule(
  snapshot: Snapshot,
  context: RuleContext,
): NoteFinding[] {
  if (snapshot.collection !== 'note') {
    return []
  }
  return [
    ...(context.noteCount > MAX_NOTES
      ? [toBlockingFinding('note-limit', 'slug', null, 'Too many notes')]
      : []),
    ...findSlugFindings(snapshot, context),
    ...findTitleFindings(snapshot),
    ...snapshot.content.flatMap(({ locale, body }) =>
      findBodyFindings({ locale, body }, context),
    ),
  ]
}

function toBlockingFinding(
  rule: string,
  field: string,
  locale: Locale | null,
  message: string,
): NoteFinding {
  return { rule, severity: 'block', field, locale, message }
}

function findSlugFindings(
  { key, fields }: NoteSnapshot,
  context: RuleContext,
): NoteFinding[] {
  const { slug } = fields
  if (!SLUG_PATTERN.test(slug)) {
    return [
      toBlockingFinding(
        'note-slug',
        'slug',
        null,
        `Slug "${slug}": use lowercase words joined by hyphens`,
      ),
    ]
  }
  const isTaken = context.noteSlugClaims.some(
    (claim) => claim.key !== key && claim.slug === slug,
  )
  return isTaken
    ? [
        toBlockingFinding(
          'note-slug-taken',
          'slug',
          null,
          `Another note uses the slug "${slug}"`,
        ),
      ]
    : []
}

function findTitleFindings({ content }: NoteSnapshot): NoteFinding[] {
  const hasItalian = content.some((record) => record.locale === 'it')
  return [
    ...(hasItalian
      ? []
      : [toBlockingFinding('note-title', 'title', 'it', 'No Italian title')]),
    ...content
      .filter((record) => record.title.trim() === '')
      .map((record) =>
        toBlockingFinding('note-title', 'title', record.locale, 'Empty title'),
      ),
  ]
}

function findBodyFindings(
  { locale, body }: { locale: Locale; body: string },
  context: RuleContext,
): NoteFinding[] {
  const { blocks, problems } = parseNoteMarkdown(body)
  return [
    ...problems.map((problem) =>
      toBlockingFinding(
        `note-${problem.kind}`,
        'body',
        locale,
        toProblemMessage(problem),
      ),
    ),
    ...blocks.flatMap((parsed): NoteFinding[] => {
      if (parsed.kind === 'metric' && !context.metricKeys.has(parsed.key)) {
        return [
          toBlockingFinding(
            'unknown-metric',
            'body',
            locale,
            `No metric "${parsed.key}"`,
          ),
        ]
      }
      if (parsed.kind !== 'figure') {
        return []
      }
      return [
        {
          rule: 'note-figure-unavailable',
          severity: 'warn',
          field: 'body',
          locale,
          message: `Figure "${parsed.mediaId}" is not shown until media exists`,
        },
      ]
    }),
  ]
}

function toProblemMessage(problem: MarkdownProblem) {
  const where = `line ${String(problem.line)}`
  return problem.kind === 'missing-attribute'
    ? `Directive "${problem.name}" needs a valid "${problem.attribute}" (${where})`
    : `"${problem.name}": ${problem.kind} (${where})`
}
