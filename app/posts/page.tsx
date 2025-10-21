import type { Metadata } from 'next'
import PostsWithFilters from '@/components/posts-with-filters'
import { getPosts } from '@/lib/posts'
import React from 'react'

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'Read my latest articles on web development, software engineering, React, Next.js, TypeScript, and modern JavaScript best practices.',
  alternates: {
    canonical: 'https://anders-games.com/posts',
  },
  openGraph: {
    title: 'Blog Posts | Anders Planck',
    description: 'Latest articles on web development, software engineering, and modern JavaScript.',
    url: 'https://anders-games.com/posts',
    type: 'website',
  },
}

export default async function PostsPages() {
  const posts = await getPosts()
  return (
    <section className='pb-24 pt-44 md:pt-40'>
      <div className='container max-w-4xl'>
        <h1 className='title mb-12'>Posts</h1>
        <PostsWithFilters initialPosts={posts} />
      </div>
    </section>
  )
}
