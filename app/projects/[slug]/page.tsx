import React from 'react'
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import MdxContent from '@/components/mdx-content';
import { getProjectBySlug, getProjects } from '@/lib/projects';

export async function generateStaticParams() {
    const projects = await getProjects();
    return projects.map(project => ({
        slug: project.slug,
    }));
}


export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    const { metadata, content } = project;
    const { title, image, author, publishedAt, tags } = metadata;

  return (
    <section className="pb-24 pt-32">
        <div className='container max-w-3xl'>
            <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground">
               <ArrowLeftIcon className='h-5 w-5' />
               <span>Back to projects</span>
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
