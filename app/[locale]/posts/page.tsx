import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server';
import PostsWithFilters from '@/components/posts-with-filters'
import { getPosts } from '@/lib/posts'
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'posts.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://anders-games.com/${locale}/posts`,
    },
    openGraph: {
      title: `${t('title')} | Anders Planck`,
      description: t('description'),
      url: `https://anders-games.com/${locale}/posts`,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
    },
  };
}

export default async function PostsPages({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'posts' });
  const posts = await getPosts(undefined, locale);

  return (
    <section className='pb-24 pt-44 md:pt-40'>
      <div className='container max-w-4xl'>
        <h1 className='title mb-12'>{t('title')}</h1>
        <PostsWithFilters initialPosts={posts} />
      </div>
    </section>
  )
}
