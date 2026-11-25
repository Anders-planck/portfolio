# 0003 · Content lives in Convex with drafts, versions and releases

Status: accepted · 2026-11-24

All editable content (profile, milestones, projects, notes, pages and chapters, block scene, motion, theme, navigation, SEO, redirects, metrics config) lives in Convex, per locale where it has copy. Editing writes a live-saved draft. Publishing is one atomic mutation that re-runs every rule on the server, writes immutable versions, groups them in a release and moves published pointers. Releases can be scheduled and rolled back. The public site reads only published pointers; preview reads drafts through a signed, expiring token. No rebuild is needed to publish.

Published content that later violates a rule (e.g. a rule is tightened) stays live and is flagged in Panoramica; the next publish of that document is blocked until fixed.

## Amendment · 2026-11-25 (ticket 03)

- **Rollback restores the site, not a document.** Rolling back to release R makes the site exactly what it was right after R: every document points again at the version it had then, and documents first published after R are unpublished. Each published release stores its full set of live versions for this. The rollback is recorded as a new release with `rolledBackFrom = R`, so it can itself be rolled back; drafts are untouched and rules are not re-run.
- **Newer content wins over a scheduled release.** A scheduled release remembers, per document, which release its published pointer came from. When it comes due, if any of those pointers moved since (a later publish or rollback), the release fails with a `conflict` listing those documents and applies nothing; otherwise the rules run again and a block fails it with `rules`. A release is always applied whole or not at all.
