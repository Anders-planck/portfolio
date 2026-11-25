import { type Infer, v } from 'convex/values'

import { figureImageValidator } from '../media/figures'

/**
 * What the site renders of a note body: blocks of runs, with every metric
 * reference already turned into its verified figure (or `unavailable`), and
 * figures with their image sources and the alt of the locale.
 * Plain data, no markup, so the page draws it with components only.
 * Convex validators cannot nest, so a case holds simple blocks only and a
 * link holds label runs only.
 */

const marksValidator = v.array(
  v.union(v.literal('strong'), v.literal('emphasis')),
)

const labelRunValidator = v.union(
  v.object({
    kind: v.literal('text'),
    text: v.string(),
    marks: marksValidator,
  }),
  v.object({
    kind: v.literal('metric'),
    key: v.string(),
    text: v.string(),
    verifiedAt: v.number(),
    marks: marksValidator,
  }),
  /** A metric with no verified figure: never a guessed number (DATA-03). */
  v.object({
    kind: v.literal('unavailable'),
    key: v.string(),
    marks: marksValidator,
  }),
  v.object({ kind: v.literal('code'), text: v.string() }),
)
export type LabelRun = Infer<typeof labelRunValidator>

export const inlineRunValidator = v.union(
  labelRunValidator,
  v.object({
    kind: v.literal('link'),
    href: v.string(),
    children: v.array(labelRunValidator),
  }),
)
export type InlineRun = Infer<typeof inlineRunValidator>

const runsValidator = v.array(inlineRunValidator)

const simpleBlockValidator = v.union(
  v.object({ kind: v.literal('paragraph'), inlines: runsValidator }),
  v.object({
    kind: v.literal('list'),
    isOrdered: v.boolean(),
    items: v.array(runsValidator),
  }),
  v.object({ kind: v.literal('quote'), paragraphs: v.array(runsValidator) }),
  v.object({
    kind: v.literal('code'),
    language: v.union(v.string(), v.null()),
    text: v.string(),
  }),
)
export type RenderedSimpleBlock = Infer<typeof simpleBlockValidator>

export const renderedBlockValidator = v.union(
  simpleBlockValidator,
  v.object({
    kind: v.literal('heading'),
    level: v.union(v.literal(2), v.literal(3)),
    id: v.string(),
    inlines: runsValidator,
  }),
  v.object({
    kind: v.literal('case'),
    id: v.string(),
    title: runsValidator,
    blocks: v.array(simpleBlockValidator),
  }),
  v.object({
    kind: v.literal('figure'),
    image: figureImageValidator,
    caption: runsValidator,
  }),
  v.object({
    kind: v.literal('metric'),
    key: v.string(),
    label: runsValidator,
    reading: v.union(
      v.object({ text: v.string(), verifiedAt: v.number() }),
      v.null(),
    ),
  }),
)
export type RenderedBlock = Infer<typeof renderedBlockValidator>

/** One entry of the Outline: a heading or a case, by its anchor. */
export const outlineEntryValidator = v.object({
  id: v.string(),
  label: v.string(),
  level: v.union(v.literal(2), v.literal(3)),
})
export type OutlineEntry = Infer<typeof outlineEntryValidator>
