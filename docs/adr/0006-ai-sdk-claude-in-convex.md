# 0006 · AI assistant: Vercel AI SDK + Claude inside Convex actions

Status: accepted · 2026-11-24

The CMS assistant runs in Convex Node actions using the Vercel AI SDK with the Anthropic provider: Claude Sonnet 5.5 (`claude-sonnet-5-5`) for rewriting and translation, Claude Haiku 5.5 (`claude-haiku-5-5`) for alt text and SEO. Structured outputs are validated with Zod. Streaming text is persisted to Convex (persistent text streaming) so the UI is reactive and survives reloads. Every run is an `aiSuggestions` row with a state machine (running → ready → accepted/rejected, or failed/cancelled), model, tokens and cost. A monthly budget and a per-request token cap are enforced server-side. The assistant never applies its own suggestion, never adds or changes numbers, never reads reserved projects, and its output passes the reserved-terms and numbers rules before it is shown. `ANTHROPIC_API_KEY` lives in Convex env.
