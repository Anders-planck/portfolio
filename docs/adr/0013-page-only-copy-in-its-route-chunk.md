# 0013 · Copy only one page shows lives in that page's chunk

Status: accepted · 2026-11-25

`src/shared/i18n/messages-*.ts` ship with every page. Copy that a single page shows and that does not come from Convex (today: the body of the engine demo at `/demo`) lives in a per-locale file next to that page (`src/pages/<page>/<page>-copy.ts`, typed `Record<Locale, …>`), so it loads with the page's route chunk. It is still locale message copy for DATA-05. What the route's `head` needs (title, description) stays in the shared messages, since `head` is not code-split.
