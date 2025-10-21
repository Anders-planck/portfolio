'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { X, CalendarIcon, Search, Check } from 'lucide-react'
import { PostMetadata } from '@/lib/posts'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

interface PostFiltersProps {
  posts: PostMetadata[]
  onFilteredPostsChange: (filteredPosts: PostMetadata[]) => void
}

export default function PostFilters({ posts, onFilteredPostsChange }: PostFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [searchOpen, setSearchOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [authorsOpen, setAuthorsOpen] = useState(false)

  // Async search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<PostMetadata[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [posts])

  // Extract all unique authors
  const allAuthors = useMemo(() => {
    const authorSet = new Set<string>()
    posts.forEach(post => {
      if (post.author) authorSet.add(post.author)
    })
    return Array.from(authorSet).sort()
  }, [posts])

  // Async search with debounce
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Simulate async search with setTimeout
    setTimeout(() => {
      const results = posts.filter(post =>
        post.title?.toLowerCase().includes(query.toLowerCase()) ||
        post.summary?.toLowerCase().includes(query.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8) // Limit to 8 suggestions

      setSearchSuggestions(results)
      setIsSearching(false)
    }, 300) // 300ms debounce
  }, [posts])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts]

    // Search filter (title + summary + tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        post =>
          post.title?.toLowerCase().includes(query) ||
          post.summary?.toLowerCase().includes(query) ||
          post.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post =>
        selectedTags.some(tag => post.tags?.includes(tag))
      )
    }

    // Author filter
    if (selectedAuthors.length > 0) {
      filtered = filtered.filter(post =>
        post.author && selectedAuthors.includes(post.author)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(post => {
        if (!post.publishedAt) return false
        return new Date(post.publishedAt) >= dateFrom
      })
    }

    if (dateTo) {
      filtered = filtered.filter(post => {
        if (!post.publishedAt) return false
        return new Date(post.publishedAt) <= dateTo
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
            (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)
          )
        case 'oldest':
          return (
            (a.publishedAt ? new Date(a.publishedAt).getTime() : 0) -
            (b.publishedAt ? new Date(b.publishedAt).getTime() : 0)
          )
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '')
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '')
        default:
          return 0
      }
    })

    return filtered
  }, [posts, searchQuery, selectedTags, selectedAuthors, sortBy, dateFrom, dateTo])

  // Update parent component when filters change
  useEffect(() => {
    onFilteredPostsChange(filteredPosts)
  }, [filteredPosts, onFilteredPostsChange])

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Toggle author selection
  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTags([])
    setSelectedAuthors([])
    setSortBy('newest')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters =
    searchQuery ||
    selectedTags.length > 0 ||
    selectedAuthors.length > 0 ||
    sortBy !== 'newest' ||
    dateFrom ||
    dateTo

  return (
    <div className="space-y-4 mb-8">
      {/* Search Row with Auto-complete */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={searchOpen}
              className="flex-1 justify-between"
            >
              <div className="flex items-center gap-2 flex-1 truncate">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">
                  {searchQuery || 'Search posts...'}
                </span>
              </div>
              {searchQuery && (
                <X
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchQuery('')
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[400px] max-w-[500px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search posts, tags, or content..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <CommandEmpty>Searching...</CommandEmpty>
                ) : searchSuggestions.length > 0 ? (
                  <CommandGroup heading="Suggestions">
                    {searchSuggestions.map(post => (
                      <CommandItem
                        key={post.slug}
                        value={post.title}
                        onSelect={() => {
                          setSearchQuery(post.title || '')
                          setSearchOpen(false)
                        }}
                        className="flex flex-col items-start gap-1 py-3"
                      >
                        <span className="font-medium">{post.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {post.summary}
                        </span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : searchQuery.trim() ? (
                  <CommandEmpty>No posts found.</CommandEmpty>
                ) : (
                  <CommandEmpty>Type to search posts...</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Tags Filter with Auto-complete */}
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {allTags.map(tag => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => toggleTag(tag)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedTags.includes(tag) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Authors Filter with Auto-complete */}
        {allAuthors.length > 0 && (
          <Popover open={authorsOpen} onOpenChange={setAuthorsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                Authors
                {selectedAuthors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedAuthors.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search authors..." />
                <CommandList>
                  <CommandEmpty>No authors found.</CommandEmpty>
                  <CommandGroup>
                    {allAuthors.map(author => (
                      <CommandItem
                        key={author}
                        value={author}
                        onSelect={() => toggleAuthor(author)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedAuthors.includes(author) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {author}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Date Range Filters with Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'gap-2',
                !dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'gap-2',
                !dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
            />
          </PopoverContent>
        </Popover>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={resetFilters} className="gap-2">
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedTags.length > 0 || selectedAuthors.length > 0 || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedAuthors.map(author => (
            <Badge
              key={author}
              variant="default"
              className="gap-1 pr-1 cursor-pointer hover:bg-primary/80"
              onClick={() => toggleAuthor(author)}
            >
              {author}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {dateFrom && (
            <Badge
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-accent"
              onClick={() => setDateFrom(undefined)}
            >
              From: {format(dateFrom, 'MMM dd, yyyy')}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {dateTo && (
            <Badge
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-accent"
              onClick={() => setDateTo(undefined)}
            >
              To: {format(dateTo, 'MMM dd, yyyy')}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>
    </div>
  )
}
