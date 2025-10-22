import fs from 'fs';
import path from 'path';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';

export type TranslationStatus = {
  locale: Locale;
  postsCount: number;
  projectsCount: number;
  postsPercentage: number;
  projectsPercentage: number;
  isComplete: boolean;
};

/**
 * Get translation completeness status for all locales
 */
export function getTranslationStatus(): TranslationStatus[] {
  const enPostsCount = getContentCount('posts', 'en');
  const enProjectsCount = getContentCount('projects', 'en');

  return locales.map((locale) => {
    const postsCount = getContentCount('posts', locale);
    const projectsCount = getContentCount('projects', locale);

    const postsPercentage = enPostsCount > 0 ? Math.round((postsCount / enPostsCount) * 100) : 0;
    const projectsPercentage = enProjectsCount > 0 ? Math.round((projectsCount / enProjectsCount) * 100) : 0;

    return {
      locale,
      postsCount,
      projectsCount,
      postsPercentage,
      projectsPercentage,
      isComplete: postsPercentage === 100 && projectsPercentage === 100,
    };
  });
}

/**
 * Get count of MDX files in a content directory for a specific locale
 */
function getContentCount(type: 'posts' | 'projects', locale: Locale): number {
  const contentDir = path.join(process.cwd(), 'content', type, locale);

  if (!fs.existsSync(contentDir)) {
    return 0;
  }

  const files = fs.readdirSync(contentDir);
  return files.filter((file) => file.endsWith('.mdx') && !file.startsWith('_')).length;
}

/**
 * Check if content exists for a specific slug and locale
 */
export function hasTranslation(
  type: 'posts' | 'projects',
  slug: string,
  locale: Locale
): boolean {
  const filePath = path.join(process.cwd(), 'content', type, locale, `${slug}.mdx`);
  return fs.existsSync(filePath);
}

/**
 * Get available locales for a specific content item
 */
export function getAvailableLocales(type: 'posts' | 'projects', slug: string): Locale[] {
  return locales.filter((locale) => hasTranslation(type, slug, locale));
}
