import { locales, type Locale } from '@/i18n/config';

type LocaleParam = { locale: Locale };
type LocaleSlugParam = { locale: Locale; slug: string };

/**
 * Returns the list of locale params for static generation.
 * Use in `generateStaticParams` for routes that only depend on the locale segment.
 */
export function generateLocaleStaticParams(): LocaleParam[] {
  return locales.map((locale) => ({ locale }));
}

/**
 * Returns the cartesian product between locales and provided slugs.
 * Use in `generateStaticParams` for routes that depend on both locale and slug segments.
 */
export function generateLocaleSlugStaticParams(
  slugs: readonly (string | null | undefined)[],
): LocaleSlugParam[] {
  const normalizedSlugs = slugs.filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  );

  return locales.flatMap((locale) =>
    normalizedSlugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

