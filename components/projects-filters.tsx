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
import { ProjectMetadata } from '@/lib/projects'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

interface ProjectFiltersProps {
  Projects: ProjectMetadata[]
  onFilteredProjectsChange: (filteredProjects: ProjectMetadata[]) => void
}

export default function ProjectFilters({ Projects, onFilteredProjectsChange }: ProjectFiltersProps) {
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
  const [searchSuggestions, setSearchSuggestions] = useState<ProjectMetadata[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Extract all unique tags from Projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    Projects.forEach(Project => {
      Project.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [Projects])

  // Extract all unique authors
  const allAuthors = useMemo(() => {
    const authorSet = new Set<string>()
    Projects.forEach(Project => {
      if (Project.author) authorSet.add(Project.author)
    })
    return Array.from(authorSet).sort()
  }, [Projects])

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
      const results = Projects.filter(Project =>
        Project.title?.toLowerCase().includes(query.toLowerCase()) ||
        Project.summary?.toLowerCase().includes(query.toLowerCase()) ||
        Project.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8) // Limit to 8 suggestions

      setSearchSuggestions(results)
      setIsSearching(false)
    }, 300) // 300ms debounce
  }, [Projects])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Filter and sort Projects
  const filteredProjects = useMemo(() => {
    let filtered = [...Projects]

    // Search filter (title + summary + tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        Project =>
          Project.title?.toLowerCase().includes(query) ||
          Project.summary?.toLowerCase().includes(query) ||
          Project.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(Project =>
        selectedTags.some(tag => Project.tags?.includes(tag))
      )
    }

    // Author filter
    if (selectedAuthors.length > 0) {
      filtered = filtered.filter(Project =>
        Project.author && selectedAuthors.includes(Project.author)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(Project => {
        if (!Project.publishedAt) return false
        return new Date(Project.publishedAt) >= dateFrom
      })
    }

    if (dateTo) {
      filtered = filtered.filter(Project => {
        if (!Project.publishedAt) return false
        return new Date(Project.publishedAt) <= dateTo
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
  }, [Projects, searchQuery, selectedTags, selectedAuthors, sortBy, dateFrom, dateTo])

  // Update parent component when filters change
  useEffect(() => {
    onFilteredProjectsChange(filteredProjects)
  }, [filteredProjects, onFilteredProjectsChange])

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
                  {searchQuery || 'Search Projects...'}
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
                placeholder="Search Projects, tags, or content..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <CommandEmpty>Searching...</CommandEmpty>
                ) : searchSuggestions.length > 0 ? (
                  <CommandGroup heading="Suggestions">
                    {searchSuggestions.map(Project => (
                      <CommandItem
                        key={Project.slug}
                        value={Project.title}
                        onSelect={() => {
                          setSearchQuery(Project.title || '')
                          setSearchOpen(false)
                        }}
                        className="flex flex-col items-start gap-1 py-3"
                      >
                        <span className="font-medium">{Project.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {Project.summary}
                        </span>
                        {Project.tags && Project.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {Project.tags.slice(0, 3).map(tag => (
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
                  <CommandEmpty>No Projects found.</CommandEmpty>
                ) : (
                  <CommandEmpty>Type to search Projects...</CommandEmpty>
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
        Showing {filteredProjects.length} of {Projects.length} Projects
      </div>
    </div>
  )
}
