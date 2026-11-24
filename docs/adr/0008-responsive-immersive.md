# 0008 · Immersive on wide fine-pointer screens, linear elsewhere

Status: accepted · 2026-11-24

Immersive pages use window scroll with real sections and a sticky scene, never an inner scroll container. At ≥1024px with a fine pointer and without reduced motion they pin the scene and animate it; otherwise the same DOM renders as a linear page (Home stacked sections with a static Block image; Lavori list; project as an article with the slab as header image; Percorso vertical timeline). Custom cursor, tilt, magnetic and parallax are disabled on touch and with `prefers-reduced-motion`.
