# Translation Management Guide

Comprehensive guide for managing and maintaining translations across the portfolio.

## Quick Reference

| Language | Code | Status | Lines | Completeness |
|----------|------|--------|-------|--------------|
| English  | `en` | ✅ Complete | 479 | 100% (Base) |
| Italian  | `it` | ✅ Complete | 479 | 100% |
| French   | `fr` | ✅ Complete | 479 | 100% |

## Translation Coverage

### Pages (100% Translated)

- ✅ **Homepage** (`/`)
  - Hero/Intro section
  - Stats overview
  - Technical proficiency
  - Featured projects
  - Contact form

- ✅ **About Page** (`/about`)
  - Professional journey
  - Work experience timeline (9 projects)
  - Education timeline
  - Personal projects
  - Skills & expertise
  - Languages & proficiency
  - Soft skills

- ✅ **Posts Page** (`/posts`)
  - Page title & subtitle
  - Search & filters
  - Sort options
  - Empty states

- ✅ **Projects Page** (`/projects`)
  - Page title & subtitle
  - Search & filters
  - Sort options
  - Empty states

- ✅ **Individual Post/Project Pages**
  - Metadata
  - Reading time
  - Author info
  - Share buttons
  - Navigation

### Components (100% Translated)

- ✅ Navigation header
- ✅ Footer
- ✅ Language switcher
- ✅ Contact form
- ✅ System banner
- ✅ Featured projects
- ✅ Recent content
- ✅ Timeline component
- ✅ Professional summary
- ✅ Languages proficiency
- ✅ Experience highlights
- ✅ Tech stack
- ✅ Skills charts

### MDX Content

| Content Type | English | Italian | French |
|--------------|---------|---------|--------|
| Blog Posts   | 1       | 1       | 1      |
| Projects     | 8       | 8       | 8      |

**Blog Posts:**
- introduction-to-mdx.mdx ✅

**Projects:**
- acube-ereceipt-sdk.mdx ✅
- expo-mutual-tls.mdx ✅
- pempel-dashboard.mdx ✅
- dashboard-v2.mdx ✅
- stripe-app.mdx ✅
- open-banking-ui.mdx ✅
- preservation-api.mdx ✅
- notifier.mdx ✅

## Translation Workflow

### For Existing Languages

#### 1. Identify What Needs Translation

Check for hardcoded English strings:

```bash
# Search for potential hardcoded strings in components
grep -r "\"[A-Z][a-z]" components/ --include="*.tsx" | grep -v "import\|export\|className"

# Search for strings that should be in translations
grep -r "'[A-Z][a-z]" app/ --include="*.tsx" | grep -v "import\|export\|className"
```

#### 2. Add to English Translation File

Edit `messages/en.json`:

```json
{
  "namespace": {
    "newKey": "English text here"
  }
}
```

#### 3. Translate to Other Languages

**Italian** (`messages/it.json`):
```json
{
  "namespace": {
    "newKey": "Testo italiano qui"
  }
}
```

**French** (`messages/fr.json`):
```json
{
  "namespace": {
    "newKey": "Texte français ici"
  }
}
```

#### 4. Update Component

```tsx
const t = useTranslations('namespace');

return <p>{t('newKey')}</p>;
```

#### 5. Test

```bash
bun dev
# Visit: http://localhost:3000/en
# Visit: http://localhost:3000/it
# Visit: http://localhost:3000/fr
```

#### 6. Build

```bash
bun run build
```

### For New Content (Blog Posts/Projects)

#### 1. Create English Version

```mdx
---
title: "My New Post"
summary: "Post summary"
publishedAt: "2025-01-22"
author: "Anders Planck"
tags: ["tag1", "tag2"]
---

# Content here
```

#### 2. Translate to Italian

Copy to `content/posts/it/my-new-post.mdx`:

```mdx
---
title: "Il Mio Nuovo Post"
summary: "Sommario del post"
publishedAt: "2025-01-22"
author: "Anders Planck"
tags: ["tag1", "tag2"]
---

# Contenuto qui
```

#### 3. Translate to French

Copy to `content/posts/fr/my-new-post.mdx`:

```mdx
---
title: "Mon Nouveau Post"
summary: "Résumé du post"
publishedAt: "2025-01-22"
author: "Anders Planck"
tags: ["tag1", "tag2"]
---

# Contenu ici
```

## Translation Keys Structure

### Namespace Organization

```
common/              # Shared UI elements
├── nav/            # Navigation links
├── pagination/     # Pagination controls
├── share/          # Social sharing
└── filters/        # Search & filter UI

home/               # Homepage sections
├── meta/          # SEO metadata
├── intro/         # Hero section
└── stats/         # Statistics

about/              # About page
├── meta/          # SEO metadata
├── timeline/      # Work/education timeline
├── techStack/     # Technology stack
└── languages/     # Language proficiency

posts/              # Blog posts page
├── meta/          # SEO metadata
└── filters/       # Post filtering

projects/           # Projects page
├── meta/          # SEO metadata
└── filters/       # Project filtering

contact/            # Contact form
├── labels/        # Form labels
├── validation/    # Error messages
└── toasts/        # Success/error notifications

footer/             # Site footer
└── social/        # Social links

components/         # Reusable components
├── featuredProjects/
├── recentContent/
├── systemBanner/
└── contactForm/

cv/                 # CV/Resume data
├── bio
├── professionalGoal
├── softSkills/
├── languages/
├── experience/
├── education/
└── personalProjects/
```

### Key Naming Conventions

1. **Use camelCase** for keys:
   ```json
   { "myKey": "value", "anotherKey": "value" }
   ```

2. **Be descriptive**:
   ```json
   {
     "good": { "contactFormSubmitButton": "Send Message" },
     "bad": { "btn": "Send" }
   }
   ```

3. **Group related keys**:
   ```json
   {
     "form": {
       "name": "Name",
       "email": "Email",
       "message": "Message"
     }
   }
   ```

4. **Use consistent plurals**:
   ```json
   {
     "projects": "Projects",
     "posts": "Posts",
     "languages": "Languages"
   }
   ```

## Translation Quality Checklist

### Before Committing Translations

- [ ] All keys exist in all language files
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] Placeholders match (e.g., `{name}` in all versions)
- [ ] Character encoding is UTF-8
- [ ] Line count matches across all files
- [ ] Build succeeds: `bun run build`
- [ ] TypeScript check passes: `bunx tsc --noEmit`
- [ ] Manual review in browser for each language

### Quality Standards

#### 1. Accuracy
- Translations convey the same meaning as English
- Technical terms are appropriately translated or kept in English
- Context is preserved

#### 2. Consistency
- Same terms translated the same way throughout
- Tone matches across languages
- Formatting is consistent

#### 3. Cultural Adaptation
- Idiomatic expressions are localized
- Examples are culturally relevant
- Units and formats match locale conventions

#### 4. Technical Correctness
- Markup is preserved (HTML, Markdown)
- Placeholders are intact: `{placeholder}`
- Special characters are properly escaped

## Common Translation Patterns

### 1. Simple Text

```json
{
  "en": { "title": "Welcome" },
  "it": { "title": "Benvenuto" },
  "fr": { "title": "Bienvenue" }
}
```

### 2. With Interpolation

```json
{
  "en": { "greeting": "Hello, {name}!" },
  "it": { "greeting": "Ciao, {name}!" },
  "fr": { "greeting": "Bonjour, {name}!" }
}
```

### 3. Plurals

```json
{
  "en": { "itemCount": "{count} {count, plural, one {item} other {items}}" },
  "it": { "itemCount": "{count} {count, plural, one {elemento} other {elementi}}" },
  "fr": { "itemCount": "{count} {count, plural, one {élément} other {éléments}}" }
}
```

### 4. Arrays (Lists)

```json
{
  "en": {
    "features": [
      "Fast performance",
      "Modern design",
      "SEO optimized"
    ]
  },
  "it": {
    "features": [
      "Prestazioni veloci",
      "Design moderno",
      "Ottimizzato per SEO"
    ]
  },
  "fr": {
    "features": [
      "Performances rapides",
      "Design moderne",
      "Optimisé pour le SEO"
    ]
  }
}
```

## Tools & Automation

### Validation Script

Create `scripts/validate-translations.js`:

```javascript
const fs = require('fs');
const path = require('path');

const locales = ['en', 'it', 'fr'];
const messagesDir = path.join(__dirname, '../messages');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const translations = {};
for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const enKeys = getKeys(translations.en).sort();

for (const locale of locales) {
  if (locale === 'en') continue;

  const localeKeys = getKeys(translations[locale]).sort();
  const missing = enKeys.filter(k => !localeKeys.includes(k));
  const extra = localeKeys.filter(k => !enKeys.includes(k));

  console.log(`\n${locale.toUpperCase()}:`);
  console.log(`  Total keys: ${localeKeys.length}`);
  console.log(`  Missing: ${missing.length}`);
  console.log(`  Extra: ${extra.length}`);

  if (missing.length > 0) {
    console.log(`  Missing keys:`, missing.slice(0, 5));
  }
  if (extra.length > 0) {
    console.log(`  Extra keys:`, extra.slice(0, 5));
  }
}

console.log(`\n✅ Validation complete`);
```

Run with: `node scripts/validate-translations.js`

### VS Code Extensions

Recommended extensions for translation work:

1. **i18n Ally** - Inline translation editing
2. **JSON Language Features** - JSON validation
3. **Error Lens** - Inline error display

## Maintenance Schedule

### Weekly
- [ ] Review new content for missing translations
- [ ] Check GitHub issues for translation bugs
- [ ] Test language switcher functionality

### Monthly
- [ ] Validate translation completeness
- [ ] Review and update outdated translations
- [ ] Check for consistency across languages

### Per Release
- [ ] Run validation script
- [ ] Full build test for all locales
- [ ] Manual QA in all languages
- [ ] Update this documentation if structure changes

## Getting Help

### Internal Resources
- `docs/INTERNATIONALIZATION.md` - Full i18n guide
- `lib/cv-translations.ts` - Translation helpers
- `i18n/config.ts` - Locale configuration

### External Resources
- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [CLDR Language Data](http://cldr.unicode.org/)

## Troubleshooting

### Issue: Translation not appearing

**Steps:**
1. Check key exists in `messages/{locale}.json`
2. Verify namespace is correct in component
3. Clear `.next` cache: `rm -rf .next`
4. Restart dev server: `bun dev`

### Issue: Build fails with missing translation

**Steps:**
1. Run: `bunx tsc --noEmit`
2. Check error message for missing key
3. Add key to all language files
4. Rebuild: `bun run build`

### Issue: Wrong language showing

**Steps:**
1. Check browser URL: `/en`, `/it`, or `/fr`
2. Verify middleware.ts is working
3. Clear browser cache and cookies
4. Check language switcher component

## Contributing Translations

If you're contributing translations:

1. **Fork the repository**
2. **Create a branch**: `git checkout -b translations/{language}`
3. **Add/update translations** in `messages/{locale}.json`
4. **Test thoroughly**: `bun dev` and `bun run build`
5. **Submit pull request** with screenshots
6. **Describe changes** in PR description

### Pull Request Checklist

- [ ] All translation files have same structure
- [ ] No hardcoded strings remain
- [ ] Build passes successfully
- [ ] Tested in browser for all languages
- [ ] Screenshots included for UI changes
- [ ] Translation quality reviewed

---

Last updated: 2025-01-22
Maintained by: Anders Planck
