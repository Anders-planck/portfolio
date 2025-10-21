import React from 'react'
import type { Metadata } from 'next'
import { getPostBySlug, getPosts } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import MdxContent from '@/components/mdx-content';

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map(post => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

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
        openGraph: {
            title: `${title} | Anders Planck`,
            description: summary || `Read ${title}`,
            type: 'article',
            url: `https://anders-games.com/posts/${slug}`,
            publishedTime: publishedAt,
            authors: author ? [author] : ['Anders Planck'],
            tags: tags || [],
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


export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const { metadata, content } = post;
    const { title, image, author, publishedAt, tags } = metadata;

  return (
    <section className="pb-24 pt-44 md:pt-40">
        <div className='container max-w-4xl'>
            <Link href="/posts" className="mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground">
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
                    {author} / {formatDate(publishedAt ?? '')}
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
