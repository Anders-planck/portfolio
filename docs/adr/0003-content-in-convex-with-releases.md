# 0003 · Content lives in Convex with drafts, versions and releases

Status: accepted · 2026-11-24

All editable content (profile, milestones, projects, notes, pages and chapters, block scene, motion, theme, navigation, SEO, redirects, metrics config) lives in Convex, per locale where it has copy. Editing writes a live-saved draft. Publishing is one atomic mutation that re-runs every rule on the server, writes immutable versions, groups them in a release and moves published pointers. Releases can be scheduled and rolled back. The public site reads only published pointers; preview reads drafts through a signed, expiring token. No rebuild is needed to publish.

Published content that later violates a rule (e.g. a rule is tightened) stays live and is flagged in Panoramica; the next publish of that document is blocked until fixed.
