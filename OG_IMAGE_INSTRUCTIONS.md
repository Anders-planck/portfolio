# OG Image Generation Instructions

## Specifications
- **Size**: 1200x630px (Facebook/Twitter/LinkedIn standard)
- **Format**: PNG or JPEG
- **Location**: `/public/og-image.png`

## Content to Include

### Text Elements
1. **Name**: Anders Planck (Large, bold)
2. **Title**: Full-Stack Developer
3. **Tagline**: React · Next.js · TypeScript · PHP · Laravel
4. **Location**: Ferrara, Italy 🇮🇹

### Design Elements
- **Background**: Gradient or solid with brand colors (orange/amber theme)
- **Logo/Monogram**: "AP" in large font
- **Tech Stack Icons**: React, Next.js, TypeScript, PHP logos (small)
- **Professional Photo**: Optional - your headshot

## Tools for Generation

### Option 1: Vercel OG Image Generator
https://og-image.vercel.app/
- Enter: "Anders Planck - Full-Stack Developer"
- Customize with tech stack

### Option 2: Canva
https://www.canva.com/
- Template: LinkedIn Cover → Resize to 1200x630
- Add text and tech icons

### Option 3: Figma
- Create 1200x630 frame
- Design custom with brand colors

### Option 4: Code-based (Next.js Dynamic OG)
Create `app/og-image/route.tsx` with ImageResponse API

## Quick Online Tool
https://www.opengraph.xyz/
- Upload photo
- Add text overlay
- Download as PNG

## After Creation
1. Save as `public/og-image.png`
2. Verify in layout.tsx references it correctly
3. Test with https://www.opengraph.xyz/url/ or https://cards-dev.twitter.com/validator
