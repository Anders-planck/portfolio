# Internationalization (i18n) Guide

Complete guide for managing translations in this Next.js portfolio application.

## Overview

This application uses **next-intl v4.3.12** for internationalization with support for:
- ✅ **English (en)** - Default language
- ✅ **Italian (it)** - Full translation
- ✅ **French (fr)** - Full translation

## File Structure

```
├── i18n/
│   ├── config.ts                 # i18n configuration
│   └── request.ts                # Server-side request handler
├── messages/
│   ├── en.json                   # English translations (479 lines)
│   ├── it.json                   # Italian translations (479 lines)
│   └── fr.json                   # French translations (479 lines)
├── middleware.ts                 # Locale detection and routing
├── lib/
│   └── cv-translations.ts        # CV translation helpers
└── app/
    └── [locale]/                 # Localized routes
        ├── page.tsx              # Homepage
        ├── about/page.tsx        # About page
        ├── posts/page.tsx        # Blog posts
        └── projects/page.tsx     # Projects
```

## Translation Files

All translations are stored in `messages/{locale}.json` with the following namespaces:

### Namespaces

1. **`common`** - Shared UI elements
   - Navigation, buttons, pagination, filters, etc.

2. **`home`** - Homepage content
   - Intro, stats, featured projects

3. **`about`** - About page
   - Journey, vision, experience, education

4. **`posts`** - Blog posts page
   - Titles, filters, empty states

5. **`projects`** - Projects page
   - Titles, filters, empty states

6. **`contact`** - Contact form
   - Labels, placeholders, validation messages

7. **`footer`** - Site footer
   - Description, copyright, social links

8. **`components`** - Reusable components
   - Featured projects, recent content, banners, forms

9. **`cv`** - CV/Resume data
   - Bio, professional goal, skills, experience, education, projects

## Using Translations

### Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('namespace');

  return <h1>{t('key')}</h1>;
}
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'namespace' });

  return <h1>{t('key')}</h1>;
}
```

### Using CV Translation Helpers

For CV-related content, use the provided helper hooks:

#### Client-Side

```tsx
'use client';
import { useCvTranslations, useSoftSkills, useLanguages } from '@/lib/cv-translations';

export default function MyComponent() {
  // Method 1: Use the translation hook directly
  const cvT = useCvTranslations();
  const bio = cvT.bio();
  const goal = cvT.professionalGoal();
  const problemSolving = cvT.softSkill('problemSolving');

  // Method 2: Get all soft skills at once
  const softSkills = useSoftSkills();
  // Returns: [{ key: 'problemSolving', name: '...', description: '...' }, ...]

  // Method 3: Get all languages
  const languages = useLanguages();
  // Returns: [{ key: 'french', name: '...', level: '...', proficiency: 100 }, ...]

  return (
    <div>
      <p>{bio}</p>
      <p>{goal}</p>
      {softSkills.map(skill => (
        <div key={skill.key}>
          <h3>{skill.name}</h3>
          <p>{skill.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Server-Side

```tsx
import { getCvTranslations } from '@/lib/cv-translations';

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cvT = await getCvTranslations(locale);

  const bio = cvT.bio();
  const goal = cvT.professionalGoal();
  const experienceDesc = cvT.experience.description(0);
  const projectDesc = cvT.experience.project.description(0, 0);
  const achievement = cvT.experience.project.achievement(0, 0, 0);

  return (
    <div>
      <p>{bio}</p>
      <p>{goal}</p>
      <p>{experienceDesc}</p>
      <p>{projectDesc}</p>
      <p>{achievement}</p>
    </div>
  );
}
```

## Adding a New Language

Follow these steps to add a new language (e.g., Spanish - `es`):

### Step 1: Update i18n Configuration

Edit `i18n/config.ts`:

```ts
export const locales = ['en', 'it', 'fr', 'es'] as const; // Add 'es'
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  fr: 'Français',
  es: 'Español', // Add Spanish
};
```

### Step 2: Create Translation File

1. Copy `messages/en.json` to `messages/es.json`
2. Translate all 479 lines maintaining the JSON structure
3. Ensure all keys match the English version

**Important**: Every key in `en.json` must exist in `es.json` with the same structure.

### Step 3: Update Middleware (Optional)

Edit `middleware.ts` if you want to auto-detect Spanish locale:

```ts
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true, // Enable locale detection
});
```

### Step 4: Add MDX Content

Create Spanish versions of blog posts and projects:

```
content/
├── posts/
│   └── es/                      # Spanish blog posts
│       └── introduction-to-mdx.mdx
└── projects/
    └── es/                      # Spanish project pages
        ├── acube-ereceipt-sdk.mdx
        ├── expo-mutual-tls.mdx
        └── ...
```

### Step 5: Test Build

```bash
bun run build
```

Verify that pages are generated for all languages including Spanish:

```
/en, /it, /fr, /es
/en/about, /it/about, /fr/about, /es/about
...
```

### Step 6: Update Language Switcher

The language switcher automatically picks up new locales from `i18n/config.ts`.

## Translation Best Practices

### 1. Use Namespaces

Organize translations by page or feature:

```json
{
  "common": { "nav": {...}, "buttons": {...} },
  "home": { "intro": {...}, "stats": {...} },
  "about": { "journey": {...}, "experience": {...} }
}
```

### 2. Nested Keys

Use nested objects for better organization:

```json
{
  "contact": {
    "form": {
      "name": "Name",
      "email": "Email",
      "message": "Message"
    },
    "validation": {
      "nameRequired": "Name is required",
      "emailInvalid": "Invalid email"
    }
  }
}
```

### 3. Interpolation

Use placeholders for dynamic values:

```json
{
  "greeting": "Hello, {name}!",
  "pagination": "Showing {start}-{end} of {total}"
}
```

```tsx
const t = useTranslations('namespace');
t('greeting', { name: 'Anders' }); // "Hello, Anders!"
t('pagination', { start: 1, end: 10, total: 100 }); // "Showing 1-10 of 100"
```

### 4. Arrays

For achievement lists or bullet points:

```json
{
  "cv": {
    "experience": {
      "0": {
        "achievements": [
          "First achievement",
          "Second achievement",
          "Third achievement"
        ]
      }
    }
  }
}
```

```tsx
const achievement = tCv(`experience.0.achievements.0`); // "First achievement"
```

### 5. Keep Structure Consistent

All language files must have identical structure. Use tools to validate:

```bash
# Compare keys between language files
diff <(jq -S 'keys' messages/en.json) <(jq -S 'keys' messages/it.json)
```

## Date Localization

Dates are automatically formatted based on locale:

```tsx
import { formatDate } from '@/lib/utils';
import { useLocale } from 'next-intl';

export default function Component() {
  const locale = useLocale();
  const formattedDate = formatDate('2025-01-15', locale);
  // en: "January 15, 2025"
  // it: "15 gennaio 2025"
  // fr: "15 janvier 2025"

  return <time>{formattedDate}</time>;
}
```

## Metadata Localization

Each page has localized metadata:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://anders-games.com/${locale}`,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
    },
  };
}
```

## Troubleshooting

### Translation Key Not Found

**Error**: `MISSING_MESSAGE: Could not resolve 'key' in messages`

**Solution**:
1. Check that the key exists in all language files
2. Verify the namespace is correct
3. Ensure JSON syntax is valid

### Build Fails with Type Errors

**Solution**:
```bash
bunx tsc --noEmit  # Check for TypeScript errors
```

### Missing Pages for New Language

**Solution**: Ensure MDX content exists for the new locale in `content/posts/{locale}/` and `content/projects/{locale}/`.

### Language Switcher Not Showing New Language

**Solution**: Verify the new locale is added to `i18n/config.ts` in the `locales` array.

## Testing Translations

### Manual Testing

1. Start dev server: `bun dev`
2. Visit each language: `http://localhost:3000/en`, `/it`, `/fr`
3. Check all pages: About, Posts, Projects, Contact
4. Verify language switcher works

### Build Testing

```bash
bun run build
```

Check that all pages generate successfully for all locales.

## Performance

- **Static Generation**: All pages are statically generated at build time
- **Bundle Size**: Each locale adds ~2-3KB to the bundle (JSON compressed)
- **No Runtime Overhead**: Translations loaded only for active locale
- **49 Pages Generated**: 16-17 pages per locale for 3 languages

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

## Support

For questions or issues with translations:
1. Check this documentation
2. Review `lib/cv-translations.ts` for CV-specific helpers
3. Inspect `messages/*.json` for translation structure
4. Test with `bun run build` to catch errors early
