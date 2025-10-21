import { PostMetadata } from '@/lib/posts'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  // Calculate estimated reading time (rough estimate: 200 words per minute)
  const getReadingTime = (summary?: string) => {
    if (!summary) return 1
    const words = summary.split(' ').length
    return Math.max(1, Math.ceil(words / 50)) // Rough estimate
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => {
        const readingTime = getReadingTime(post.summary)
        const authorInitials = post.author
          ? post.author
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : 'AP'

        return (
          <Card
            key={post.slug}
            className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 flex flex-col p-0"
          >
            <Link href={`/posts/${post.slug}`} className="flex flex-col flex-1">
              <CardHeader className="space-y-4 flex-1 py-4">
                <div className="space-y-3">
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </CardTitle>
                  {post.summary && (
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                      {post.summary}
                    </CardDescription>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-medium px-2.5 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4 px-6">
                <Separator />

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {/* Author */}
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={undefined} alt={post.author} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground/90">{post.author}</span>
                    </div>
                  )}

                  {/* Date */}
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <time dateTime={post.publishedAt} className="text-xs">
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                  )}

                  {/* Reading time */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{readingTime} min read</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 px-6 pb-6 mt-auto">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  <span>Read article</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardFooter>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
