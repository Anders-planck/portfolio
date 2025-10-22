import React from 'react'
import type { Metadata } from 'next'
import { getPostBySlug, getPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import MdxContent from '@/components/mdx-content';
import { BlogPostingStructuredData, BreadcrumbStructuredData } from '@/components/structured-data';
import ShareButtons from '@/components/share-buttons';
import { Separator } from '@/components/ui/separator';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams() {
    const posts = await getPosts();
    const params = [];

    // Generate params for all locales and all posts
    for (const locale of locales) {
        for (const post of posts) {
            params.push({
                locale,
                slug: post.slug,
            });
        }
    }

    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug, locale);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    const { metadata } = post;
    const { title, summary, image, author, publishedAt, tags } = metadata;

    return {
        title,
        description: summary || `Read ${title} by ${author || 'Anders Planck'}`,
        authors: author ? [{ name: author }] : [{ name: 'Anders Planck' }],
        keywords: tags || [],
        alternates: {
            canonical: `https://anders-games.com/${locale}/posts/${slug}`,
        },
        openGraph: {
            title: `${title} | Anders Planck`,
            description: summary || `Read ${title}`,
            type: 'article',
            url: `https://anders-games.com/${locale}/posts/${slug}`,
            publishedTime: publishedAt,
            authors: author ? [author] : ['Anders Planck'],
            tags: tags || [],
            locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
            images: image ? [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title || 'Blog post image',
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Anders Planck`,
            description: summary || `Read ${title}`,
            images: image ? [image] : [],
        },
    };
}


export default async function Post({ params }: Props) {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug, locale);

    if (!post) {
        notFound();
    }

    const { metadata, content } = post;
    const { title, summary, image, author, publishedAt, tags, readingTime } = metadata;

  return (
    <>
      <BlogPostingStructuredData
        title={title || 'Blog Post'}
        description={summary || ''}
        publishedAt={publishedAt || new Date().toISOString()}
        slug={slug}
        image={image}
        author={author}
        tags={tags}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: `https://anders-games.com/${locale}` },
          { name: 'Posts', url: `https://anders-games.com/${locale}/posts` },
          { name: title || 'Post', url: `https://anders-games.com/${locale}/posts/${slug}` },
        ]}
      />
      <section className="pb-24 pt-44 md:pt-40">
        <div className='container max-w-4xl'>
            <Link href={`/${locale}/posts`} className="mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground">
               <ArrowLeftIcon className='h-5 w-5' />
               <span>Back to posts</span>
            </Link>

            {image && (
                <div className='relative mb-6 h-96 w-full overflow-hidden rounded-lg'>
                    <Image
                        src={image}
                        alt={title || 'Post Image'}
                        fill
                        className='object-cover'
                    />
                </div>
            )}

            <header>
                <h1 className='title'>{title}</h1>
                <p className='mt-3 text-xs text-muted-foreground'>
                    {author} / {formatDate(publishedAt ?? '', locale)} {readingTime && `• ${readingTime}`}
                </p>
                <div className='mt-6 flex flex-wrap gap-2'>
                    {tags?.map((tag) => (
                        <span key={tag} className='rounded-full bg-muted px-3 py-1 text-xs font-medium'>
                            {tag}
                        </span>
                    ))}
                </div>
            </header>

            <main className='prose mt-16 dark:prose-invert'>
                <MdxContent source={content} />
            </main>

            <Separator className='my-12' />

            <div className='flex flex-col gap-6'>
                <ShareButtons
                    url={`https://anders-games.com/${locale}/posts/${slug}`}
                    title={title || 'Blog Post'}
                    description={summary}
                />
            </div>
        </div>
      </section>
    </>
  )
}
