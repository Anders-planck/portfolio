'use client'

import { useState, useMemo, useCallback } from 'react'
import { PostMetadata } from '@/lib/posts'
import PostFilters from '@/components/post-filters'
import Posts from '@/components/posts'
import Pagination from '@/components/pagination'

interface PostsWithFiltersProps {
  initialPosts: PostMetadata[]
}

export default function PostsWithFilters({ initialPosts }: PostsWithFiltersProps) {
  const [filteredPosts, setFilteredPosts] = useState<PostMetadata[]>(initialPosts)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)

  // Get current page posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPosts.slice(startIndex, endIndex)
  }, [filteredPosts, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  const handleFilteredPostsChange = useCallback((posts: PostMetadata[]) => {
    setFilteredPosts(posts)
    setCurrentPage(1)
  }, [])

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page
  }, [])

  return (
    <>
      <PostFilters
        posts={initialPosts}
        onFilteredPostsChange={handleFilteredPostsChange}
      />

      {filteredPosts.length > 0 ? (
        <>
          <Posts posts={paginatedPosts} />

          {filteredPosts.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredPosts.length}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No posts found.</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </>
  )
}
