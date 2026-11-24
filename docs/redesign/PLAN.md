# Portfolio v3 — spec and implementation plan

Status: ready for `/to-spec` → `/to-tickets` → `/implement-spec` · 24 Nov 2026

Read first, in this order:
1. `GLOSSARY.md` (domain words) and every ADR in `docs/adr/` (decisions that are already made).
2. This file. The "Design resolutions" section overrides the mockups wherever they disagree.
3. `docs/redesign/design/` — the approved mockups, the reference for look, copy, motion and data. Open them in a browser or read the markup; they are HTML "design components" (`{{holes}}` + a small `Component` class). Do not port their code: rebuild with Astryx components.
   - Public site: `Home`, `Lavori`, `Percorso`, `ProgettoView` (+ `p-<slug>` wrappers, one per project), `Note`, `Nota`, `NotFound`, `Motion`.
   - CMS: `cms-*` (17 screens) and `AiAssist`.
   - Live canvas (owner only): https://claude.ai/artifact/5rz25ZiRJMeP2BvJLGjjSu — page "Sito · prototipo".
4. `docs/redesign/reviews/` — the two independent design reviews that the resolutions answer.
5. `docs/redesign/reference/` — Convex + TanStack Start official guides. Astryx: `bunx astryx docs`, `bunx astryx component <Name>`, `bunx astryx search`.

## Problem Statement

The owner (Anders Planck, Software Engineer) has a portfolio that reads like a template, makes claims nobody can verify, hides the work behind decoration, and can only be changed by editing code. Recruiters bounce off unverifiable numbers and slow animation; the owner cannot update projects, notes, translations, or the look and motion of the site without a deploy, and has no safe way to keep an employer's confidential details out of public copy.

## Solution

A new site, built from scratch, that is immersive on wide screens (scroll chapters with a 3D Block, a pointer-aware cursor, slabs for projects) and plain and fast everywhere else, where every number has a visible source, and where everything — copy in four languages, projects, notes, career path, the Block, chapter timing, motion, theme, navigation, SEO, media — is edited in a private CMS. Publishing is instant (Convex releases), reversible, and guarded by rules: no free numbers, no placeholders, no reserved terms, alt text everywhere, AI proposals only applied by the owner. An AI assistant helps rewrite, translate, write alt text and SEO, and flags unverifiable claims, and it never decides alone.

## User Stories

Visitor and recruiter
1. As a recruiter, I want to see role, employer, location and years of experience in the first screen, so that I can decide in seconds whether to read on.
2. As a recruiter, I want to reach the list of projects in one click from anywhere, so that decoration never stands between me and the work.
3. As a recruiter, I want every number to show where it comes from and when it was checked, so that I can trust it.
4. As a recruiter, I want each project page to state the problem, the architecture, the AI involvement and the limits, so that I can judge real engineering.
5. As a recruiter, I want to see how the owner reviews AI-written code, with concrete cases, so that I can assess AI usage as a skill and not a risk.
6. As a recruiter, I want a career path with dates, roles and one result per step, so that I can match it with the CV.
7. As a recruiter, I want to download the CV as a PDF, so that I can share it internally.
8. As a recruiter, I want links to repositories, npm packages and live sites, so that I can verify for myself.
9. As a visitor, I want previous/next project navigation and my position (e.g. 3/9), so that I can browse projects in sequence.
10. As a visitor, I want to filter projects by kind, so that I can focus on what matters to me.
11. As a visitor, I want to scroll through chapters on a wide screen with a Block that reacts to scroll and pointer, so that the site feels crafted.
12. As a visitor, I want to drag the Block and have it snap to a face, so that I can explore it in a controlled way.
13. As a visitor on a phone, I want a fast linear version with the same content, so that I am not forced through a desktop experience.
14. As a visitor using a keyboard, I want every chapter, slab, link and control reachable and visible on focus, so that I can use the site without a mouse.
15. As a visitor using a screen reader, I want all chapters present in the page with proper headings, so that I can navigate and search the whole content.
16. As a visitor with reduced motion enabled, I want no parallax, tilt, magnetic or continuous rotation, so that the site does not make me sick.
17. As a visitor, I want the custom cursor only where it helps (fine pointer), so that the system cursor is never hidden on touch.
18. As a visitor, I want to switch language among IT, EN, FR and DE and stay on the same page, so that I can read in my language.
19. As a visitor, I want a page in a missing translation to fall back to English (or Italian) with a notice, so that I never hit a dead end.
20. As a visitor, I want Back to return to where I was and chapter links I can share, so that navigation behaves like the web.
21. As a visitor, I want to read notes with a table of contents that follows my reading and a progress bar, so that long notes are easy to follow.
22. As a visitor, I want a 404 page that brings me back home or to the work in my language, so that broken links do not lose me.
23. As a visitor coming from an old link (/projects/…), I want to land on the right new page, so that shared links keep working.
24. As a search engine, I want server-rendered pages with titles, descriptions, canonical, hreflang, Open Graph and a sitemap, so that the site is indexed correctly.

Owner and editor
25. As the owner, I want to sign in with my GitHub account and be the only one allowed, so that nobody else can change the site.
26. As the owner, I want an overview of drafts, pending AI proposals, rule violations, source health, last release and AI spend, so that I know what needs attention.
27. As the owner, I want my edits saved automatically with a visible "saved" indicator, so that I never lose work.
28. As the owner, I want to edit the profile hero, status label, CTA labels, contacts, social links and CV file, so that the first screen is always current.
29. As the owner, I want to edit milestones with period, year, role, note, bullets, tags and the Block face they map to, so that Percorso stays accurate.
30. As the owner, I want to create, reorder (also by keyboard), hide and delete projects, so that the gallery and the next/previous order match my priorities.
31. As the owner, I want to edit every project field in tabs (card, numbers, chapters, AI, slab, SEO) per locale, so that every part of the project page is under my control.
32. As the owner, I want to mark a project as reserved, so that only method is shown and reserved terms are enforced.
33. As the owner, I want to write notes in Markdown with directives (case, metric, figure), schedule them and link them to projects, so that writing is fast and structured.
34. As the owner, I want to edit each page's chapters: order, eyebrow, title, copy, scroll share, visibility and content source, so that I can shape the pacing.
35. As the owner, I want to edit the Block: faces (label, number, year, linked project, colour token), size, perspective, initial tilt, per-chapter motion, drag/snap and pointer follow, so that the 3D is mine to tune.
36. As the owner, I want to tune motion through Astryx tempo and character plus our own knobs (entry distance, stagger, title line delay, cursor labels and sizes, ring inertia, magnetic radius/strength, card tilt), so that the feel is adjustable without code.
37. As the owner, I want to change the theme (type scale base/ratio, fonts, project colour tokens, radius multiplier, colour mode), so that the look evolves without a deploy.
38. As the owner, I want to edit navigation, language settings, per-page and per-locale SEO, OG images and redirects, so that the site is discoverable.
39. As the owner, I want each number to be a metric with a source, refresh rule and status, and to insert it in text by reference, so that no free number ever ships.
40. As the owner, I want manual metrics to require evidence and to expire after 90 days, so that stale facts get re-checked.
41. As the owner, I want to upload images and files to R2 with per-locale alt text, automatic AVIF/WebP variants and usage tracking, so that media are fast and accessible.
42. As the owner, I want a translation matrix with stale markers when the source changes, side-by-side editing, a glossary and AI draft translations marked "to review", so that four languages stay in sync.
43. As the owner, I want publish to show a per-field per-locale diff, let me pick what to include, add a note, publish now or schedule, so that releases are deliberate.
44. As the owner, I want to roll back to any previous release, see version history per document and restore from trash, so that mistakes are cheap.
45. As the owner, I want publish blocked by failing rules (free numbers, placeholders, reserved terms, missing AI section, missing alt, unreviewed AI proposals) and warned by others (missing translations, heavy images), so that quality is enforced.
46. As the owner, I want to manage reserved terms without ever displaying them, so that they never leak from the CMS either.
47. As the owner, I want an AI assistant in editors that streams its proposal, shows steps, a before/after diff and a rationale, and that I can cancel, accept, reject (with reason), regenerate and undo, so that AI saves time without taking decisions.
48. As the owner, I want AI cost per request and per month, a hard budget and clear errors (timeout, rate limit, refusal), so that AI never surprises me.
49. As the owner, I want a draft preview of any page per locale and per width via a signed link, so that I can check before publishing.
50. As the owner, I want an activity log and a list of sessions I can revoke, so that I can audit access.

## Implementation Decisions

### Modules (deep modules, small interfaces)
- **Content store (Convex):** documents per collection, each with a draft, versions and a published pointer; per-locale content records; release creation, scheduling and rollback; preview tokens. Interface: `saveDraft`, `publish(selection, note, at?)`, `rollback(releaseId)`, `getPublished(collection, key, locale)`, `getDraft(token)`.
- **Rules engine (pure TypeScript, shared by CMS and server):** input a document snapshot (all locales) + context, output findings `{rule, severity, field, locale, message}`. Rules: free numerals (ADR 0004), placeholders `[...]`, reserved terms (via a server-only matcher, ADR 0009), project AI section present, alt per locale, unreviewed AI drafts, translation coverage, image weight. Same code runs live in editors and authoritatively in `publish`.
- **Metrics:** table of metrics with source adapters (npm downloads API, GitHub REST/search with token, manual with evidence and expiry); a Convex cron refreshes; readings history; rendering of `{{m:key}}` with locale formatting and rounding; failure keeps last verified value + date.
- **Media:** presigned R2 upload from an action, metadata in Convex, variants via Cloudflare Image transformations on the Workers domain, EXIF stripped, per-locale alt, usage graph.
- **AI assistant:** `aiSuggestions` state machine; Node actions with AI SDK + Anthropic; persistent streaming; cancellation; budget and token caps; prompts per mode (project rewrite/shorten/verify claims, note clarity/title/repetitions, translate EN/FR/DE with glossary, alt text with vision, SEO title/description with length); output passes rules before it is stored.
- **Site experience (frontend):** `Stage` (window scroll, sticky scene, active chapter via IntersectionObserver, chapters always in the DOM with anchors), `ChapterIndex` (Astryx `Stepper`), `Block` (CSS 3D faces, scroll-driven transform, pointer follow, drag with snap, keyboard ‹ ›, all via refs/motion values), `SlabGallery`, `Cursor` (fine pointer only, ring + dot, labels from data attributes, theme-coloured with a contrast outline), `Reveal`/`Stagger`, `Magnetic` (measures with `getBoundingClientRect`), `MotionProvider` (reads published motion params + Astryx tempo/character, honours reduced motion), `LinearLayout` fallback (ADR 0008).
- **Site shell:** one shared header (Astryx `TopNav`) with current-page `aria-current`, language `DropdownMenu` (keyboard, Esc, focus), CV `Button`, mobile menu; footer; locale routing (IT default without prefix, `/en`, `/fr`, `/de`); 404; redirects; SEO head.
- **CMS app:** under `/cms`, Astryx `AppShell` + `SideNav`; groups "Contenuti", "Sito" (not "Esperienza"), "Qualità"; every screen from `docs/redesign/design/cms-*` adapted per the resolutions below.

### Data model (Convex tables; names indicative)
`users` (role), `sessions` · `profile` + `profileContent{locale}` + `links` · `milestones` + `milestoneContent{locale}` · `projects{slug, order, kind, stage, visibility, period, org, year, colorToken, links{repo,npm,live}}` + `projectContent{locale, title, sub, problemTitle, problem, arch[{t,d,emphasis}], archNote, aiProduct, aiDev, limits[], learned, seo{title,desc,ogMediaId,slug}, reviewState, sourceHash}` · `notes{slug, topic, status, scheduledAt, linkedProjectIds}` + `noteContent{locale, title, body, seo}` · `pages{key}` + `chapters{pageKey, order, share, visible, source}` + `chapterContent{locale, eyebrow, title, body, ctas}` · `scene{faces[{n, year, label per locale, projectId, colorToken}], size, perspective, tilt, chapterMotion[], drag, pointerFollow}` · `motion{tempo, character, entryDistance, stagger, lineDelay, cursor{…}, magnetic{…}, cardTilt}` · `theme{base, ratio, fonts, radiusMultiplier, mode, projectColors}` · `navigation`, `redirects{from, to, code}` · `metrics{key, label per locale, sourceType, query, value, verifiedAt, evidence, expiresAt, status, rounding}` + `metricReadings` · `media{r2Key, mime, width, height, variants, bytes, usage}` + `mediaAlt{locale, alt, reviewState}` · `aiSuggestions{target, field, locale, mode, before, after, rationale, status, model, tokensIn, tokensOut, costUsd, error, decidedAt, rejectReason}` · `versions{docTable, docId, snapshot, author, createdAt}` · `releases{versionIds, note, publishedAt, scheduledAt, rolledBackFrom}` · `rules{key, enabled, severity}` · `reservedTermHashes` (internal only) · `auditLog`.
Project colour lives only in `projects.colorToken`; a face references a project and inherits its colour (single source of truth).

### Design resolutions (binding; they answer `docs/redesign/reviews/`)
Site
1. One header for every page (TopNav): logo → Home, Lavori / Note / Percorso with `aria-current`, language DropdownMenu that switches locale on the same route, CV button; a menu button under 1024px. No breadcrumb duplication; project pages show "Lavori / {title}" under the header.
2. Immersive pages use window scroll and real sections, all chapters in the DOM with `id` anchors and real headings; the scene is `position: sticky`. Back restores scroll; `#chapter` deep links work; Page Up/Down, Space and arrows work without clicking.
3. The control under the Block is always "chapter navigation" (‹ title n/N ›); Block rotation is by drag only. Chapter numbers are consistent: the control and the eyebrow share the same index (00 = opening).
4. Home Block faces are buttons that rotate to that face; slabs are links only in the gallery chapter. The Home gallery shows the first 5 projects in project order; the control counts what is shown.
5. Lavori: scroll length depends on the number of slabs after filtering; every slab is keyboard focusable, focusing a slab scrolls it to centre; details (line, proof) are visible on the centred slab and in a visually hidden description for every slab.
6. Projects get previous and next, position "n / N", and links to repo, npm and live site from `projects.links`.
7. Linear layout under 1024px, on touch, or with reduced motion (ADR 0008). Check 1280×720: nothing overlaps the bottom bar.
8. Cursor only with a fine pointer and no reduced motion; system cursor never hidden otherwise; ring colour adapts (outline) so it stays visible on dark slabs.
9. Reduced motion disables parallax, tilt, magnetic, continuous rotation and smooth scrolling; chapters cross-fade.
10. Astryx components replace reinvented parts: Button/Link, SegmentedControl, TopNav, DropdownMenu, StatusDot, Token, ProgressBar, Stepper, Outline, MetadataList, List/Item, Banner, Heading/Text. No raw divs or inline styles; theme tokens only.
11. One line-height and type scale from the theme (base 16, ratio 1.25 on the site); no fixed rem sizes.
12. Content consistency: numbers come from metrics (ADR 0004) so they cannot diverge; one title and one kind label per project everywhere; Home timeline in chronological order; Home says "un caso reale" until the note tells two; notes "next" skips unpublished notes; filters count published notes only; never show internal file paths.
13. Names: Block = "blocco", slab = "lastra" (GLOSSARY).
CMS
14. Saving is automatic with a "Salvato · hh:mm" indicator; no "Salva in bozza" buttons.
15. Pubblica = per-field per-locale diff, select changes, release note, publish now or schedule, roll back; Panoramica = last release, drafts, pending AI proposals, violations (including live content now failing a rule), source health, AI spend. No GitHub/commit/Vercel anywhere.
16. Project editor implements all tabs: Scheda, Numeri, Capitoli, AI, Lastra 3D, SEO — every ProgettoView field, per locale, with real `role="tab"`.
17. Home chapters edit eyebrow, title, copy, CTAs, scroll share (editable), visibility and source; Percorso milestones edit year, note, bullets, tags; header stats are metrics.
18. Every reorder has keyboard move up/down; every fake control becomes a real control or plain text; "always on" accessibility rules are text, not toggles; drafts are never indexed (not a setting).
19. Per-locale alt, SEO title/description, slug, `og:locale`, canonical and hreflang; SEO rows include Nota and 404.
20. Extra screens: users & sessions, version history with diff and restore, preview per locale/width, trash, redirects (free), activity log, AI usage & errors. Accesso says "Accedi con GitHub" without repo/branch wording; Tema shows the stored theme params, not generated build code.
21. AI assistant: persisted suggestions, cancel while running, failed state with retry, cost and model shown, undo after accept, reject with reason, `aria-live` announces only the final text, no numbers in output (alt text describes, it does not quote figures), no GitHub reading (it reads Convex content only). SEO mode appears in each SEO row.
22. Inputs use tokens and real pickers (date picker, multi-select of projects), not raw px.

### Seed content
Seed only from the verified data in the mockups (`ProgettoView` data, `Percorso`, `Home`) and the metrics listed in `cms-fonti`. Placeholders the owner must fill before launch: "Cosa ho imparato" (9 projects), pizzeria client need, LECO users. Madisoft is reserved: method only, no product or domain words.

### Environments and secrets
Convex env: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` (metrics on private repos), `OWNER_GITHUB_IDS`, `RESERVED_TERMS_SALT`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, R2 credentials, `PREVIEW_TOKEN_SECRET`. Workers env: `VITE_CONVEX_URL`. Use the `wizard` skill to walk the owner through creating the GitHub OAuth app, the R2 bucket and keys, the Cloudflare Workers project and the Convex production deployment.

## Testing Decisions
- Test external behaviour only. Highest seams: Convex functions through `convex-test` (publish/rollback, rules on publish, metrics refresh with mocked fetch, AI suggestion state machine with a mocked model, auth/ownership on every CMS function); the rules engine and metric-reference parser as pure modules with Vitest; the site and CMS through Playwright (keyboard chapter navigation, reduced motion, touch/linear layout, language switch, 404, redirects, CMS edit → preview → publish → rollback).
- Accessibility: axe checks in Playwright on every public page in both layouts; `astryx doctor --built` must pass.
- Performance budget: LCP < 2.5s and JS < 200KB gzip on Home (mobile, 4G profile); no React re-render per animation frame.
- Use the `tdd` skill (red-green-refactor) for the content store, rules engine, metrics and AI state machine.

## Out of Scope
WebGL/React Three Fiber scenes (ADR 0007); multi-user roles beyond the owner; comments on the public site; analytics dashboards; e-commerce; migrating the v2 code.

## Proposed tickets (tracer bullets; confirm with the owner in `/to-tickets` before publishing)
1. **Fresh app** — delete legacy code; scaffold TanStack Start + Convex (`create convex -t tanstack-start`) with bun; Astryx (`astryx init`, theme neutral, Tailwind bridge, layer order); Cloudflare Workers target; Biome, Vitest, Playwright, CI; a deployed hello page reading one Convex query. Blocked by: none.
2. **Spike: Astryx runtime theme and motion** — prove the published `theme`/`motion` params can drive Astryx at request time (`defineTheme` / Theme provider / CSS variables); record the result as an ADR. Blocked by: 1.
3. **Content store** — drafts, versions, releases, publish/rollback/schedule, preview token, with Profile as the first collection rendered on a bare Home. Blocked by: 1.
4. **Owner auth and CMS shell** — Convex Auth GitHub + allowlist + `requireOwner`, sessions; CMS AppShell/SideNav, Accesso, empty Panoramica; Profile editor saving drafts and publishing. Blocked by: 3.
5. **Metrics** — table, npm/GitHub/manual adapters, cron, readings, `{{m:key}}` rendering, free-number rule; CMS Fonti. Blocked by: 3.
6. **Site shell and motion system** — shared header with working language menu, locale routing and fallback notice, footer, 404, redirects, SEO head; MotionProvider, Cursor, Reveal/Stagger, Magnetic, reduced-motion and touch detection. Blocked by: 1, 2.
7. **Immersive engine** — Stage with sticky scene and DOM chapters, ChapterIndex, Block (CSS 3D, scroll, pointer, drag/snap, keyboard), linear fallback; demo page. Blocked by: 6.
8. **Home end-to-end** — Home from Convex (chapters, scene, first 5 slabs, AI points, timeline, contacts); CMS "Pagine e capitoli" and "Scena 3D". Blocked by: 3, 4, 5, 7.
9. **Projects** — project collection, ProgettoView immersive + linear, prev/next/position/links, Lavori gallery with filters and focus; CMS Progetti and full project editor (all tabs); reserved visibility. Blocked by: 8.
10. **Percorso** — milestones collection, immersive + vertical timeline; CMS milestones in Profilo. Blocked by: 8.
11. **Notes** — Markdown with directives (case, metric, figure), Note list, Nota with Outline and progress, scheduling, linked projects; CMS Note and note editor. Blocked by: 3, 6.
12. **Media on R2** — presigned upload, variants, EXIF strip, per-locale alt, usage; CMS Media; alt rule; replace mockup screenshots with real images. Blocked by: 4.
13. **Translations** — per-locale content everywhere, sourceHash staleness, fallback, glossary; CMS Traduzioni. Blocked by: 9, 11.
14. **AI assistant** — suggestions state machine, AI SDK + Claude actions, persistent streaming, cancel/error/retry, budget and cost, undo; AiAssist in project, note, translations, media, SEO. Blocked by: 9, 12, 13.
15. **Publishing and quality** — reserved-terms hashing and server check (incl. AI output and media metadata), full rules set and CMS Regole, Pubblica redesign (diff, select, schedule, rollback), Panoramica live, version history and restore, trash, activity log, users & sessions. Blocked by: 5, 9, 11, 12.
16. **Theme, motion, navigation and SEO editing** — CMS Tema e tipografia, Animazioni e cursore, Navigazione e SEO (hreflang, canonical, OG per locale, sitemap, redirects editor). Blocked by: 2, 6, 15.
17. **Hardening and launch** — axe and keyboard pass, performance budget, full Playwright suite, `astryx doctor`, seed content complete, launch checklist, DNS cutover with the `wizard` skill. Blocked by: 1–16.

## Further Notes
- Use the repo's Matt Pocock skills: `/to-spec` (publish this spec as the parent GitHub issue, `ready-for-agent`), `/to-tickets` (publish the tickets as sub-issues with native blocking edges, after the owner confirms the breakdown), `/implement-spec` (frontier-driven, fresh subagent per ticket, one integration branch), `tdd`, `codebase-design` for module seams, `domain-modeling` to keep `GLOSSARY.md` and ADRs current, `code-review` per ticket, `pr` for the PR body, `wizard` for credentials and infrastructure steps only the owner can do, `writing-for-agents` when editing AGENTS.md.
- Integration branch: `redesign/v3`. Never push to `master`; one PR from the integration branch at the end.
- Copy is Italian first; EN/FR/DE are drafted by the assistant and reviewed by the owner.
