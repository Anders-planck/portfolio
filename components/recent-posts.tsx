import Posts from '@/components/posts'
import { getPosts } from '@/lib/posts';
import Link from 'next/link';
import React from 'react'

export default async function RecentPosts() {
    const posts = await getPosts(1);
  return (
    <section className='pb-24'>
        <div>
            <h2 className='title mb-12'>Recent Posts</h2>

            <Posts posts={posts} />

            <Link 
                href="/posts" 
                className='mt-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground underline'
            >
               <span>All posts</span>
            </Link>
        </div>
    </section>
  )
}
