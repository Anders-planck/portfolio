# 0007 · CSS 3D for the Block, not WebGL, in v1

Status: accepted · 2026-11-24

The Block and slabs are DOM elements with CSS 3D transforms: crisp text, real links and buttons, server-rendered, accessible, cheap. Pointer and scroll effects write transforms through refs / motion values, never React state per frame. React Three Fiber can be reconsidered later for an optional Home scene behind a lazy client-only boundary with a static poster.
