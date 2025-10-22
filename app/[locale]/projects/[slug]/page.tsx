import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import MdxContent from '@/components/mdx-content';
import { getProjectBySlug, getProjects } from '@/lib/projects';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams() {
    const projects = await getProjects();
    const params = [];

    // Generate params for all locales and all projects
    for (const locale of locales) {
        for (const project of projects) {
            params.push({
                locale,
                slug: project.slug,
            });
        }
    }

    return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const project = await getProjectBySlug(slug, locale);

    if (!project) {
        return {
            title: 'Project Not Found',
        };
    }

    const { metadata } = project;
    const { title, summary, image, author, publishedAt, tags } = metadata;

    return {
        title,
        description: summary || `Explore ${title} - a project by ${author || 'Anders Planck'}`,
        authors: author ? [{ name: author }] : [{ name: 'Anders Planck' }],
        keywords: tags || [],
        alternates: {
            canonical: `https://anders-games.com/${locale}/projects/${slug}`,
        },
        openGraph: {
            title: `${title} | Anders Planck`,
            description: summary || `Explore ${title}`,
            type: 'article',
            url: `https://anders-games.com/${locale}/projects/${slug}`,
            publishedTime: publishedAt,
            authors: author ? [author] : ['Anders Planck'],
            tags: tags || [],
            locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
            images: image ? [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title || 'Project image',
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Anders Planck`,
            description: summary || `Explore ${title}`,
            images: image ? [image] : [],
        },
    };
}


export default async function Project({ params }: Props) {
    const { locale, slug } = await params;
    const project = await getProjectBySlug(slug, locale);

    if (!project) {
        notFound();
    }

    const { metadata, content } = project;
    const { title, image, author, publishedAt, tags, readingTime } = metadata;

  return (
    <section className="pb-24 pt-44 md:pt-40">
        <div className='container max-w-4xl'>
            <Link href={`/${locale}/projects`} className="mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground">
               <ArrowLeftIcon className='h-5 w-5' />
               <span>Back to projects</span>
            </Link>

            {image && (
                <div className='relative mb-6 h-96 w-full overflow-hidden rounded-lg'>
                    <Image
                        src={image}
                        alt={title || 'Project Image'}
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
        </div>
    </section>
  )
}
