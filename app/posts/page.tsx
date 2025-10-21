import PostsWithFilters from '@/components/posts-with-filters'
import { getPosts } from '@/lib/posts'
import React from 'react'

export default async function PostsPages() {
  const posts = await getPosts()
  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        <h1 className='title mb-12'>Posts</h1>
        <PostsWithFilters initialPosts={posts} />
      </div>
    </section>
  )
}
