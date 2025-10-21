import { PostMetadata } from '@/lib/posts'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import {
  Card,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { ProjectMetadata } from '@/lib/projects'

export default function Projects({ projects }: { projects: ProjectMetadata[] }) {
  // Calculate estimated reading time (rough estimate: 200 words per minute)
  const getReadingTime = (summary?: string) => {
    if (!summary) return 1
    const words = summary.split(' ').length
    return Math.max(1, Math.ceil(words / 50)) // Rough estimate
  }

  return (
    <div className={cn(
      'grid grid-cols-1 gap-6',
      projects.length >= 2 ? 'sm:grid-cols-2 md:grid-cols-3' : '',
    )}>
      {projects.map((project) => {
        const readingTime = getReadingTime(project.summary)
        const authorInitials = project.author
          ? project.author
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : 'AP'

        return (
          <Card
            key={project.slug}
            className="group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 flex flex-col p-0 h-[400px]"
          >
            <Link href={`/projects/${project.slug}`} className="relative w-full h-full block">
              {/* Background Image - Always visible */}
              {project.image && (
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={project.image}
                    alt={project.title || 'Project Image'}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}

              {/* Default State: Gradient overlay with title at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex items-end p-6">
                <h3 className="text-white text-2xl font-bold line-clamp-2">
                  {project.title}
                </h3>
              </div>

              {/* Hover State: Full details overlay */}
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col p-6 justify-between">
                {/* Top section: Title, Summary, Tags */}
                <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <CardTitle className="text-2xl font-bold text-white line-clamp-2 leading-tight">
                    {project.title}
                  </CardTitle>

                  {project.summary && (
                    <CardDescription className="text-gray-200 line-clamp-3 text-sm leading-relaxed">
                      {project.summary}
                    </CardDescription>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-medium px-2.5 py-0.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2.5 py-0.5 border-white/30 text-white"
                        >
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom section: Metadata and CTA */}
                <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <Separator className="bg-white/20" />

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {/* Author */}
                    {project.author && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-white/30">
                          <AvatarImage src={undefined} alt={project.author} />
                          <AvatarFallback className="text-xs bg-white/10 text-white">
                            {authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{project.author}</span>
                      </div>
                    )}

                    {/* Date */}
                    {project.publishedAt && (
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Calendar className="h-3.5 w-3.5" />
                        <time dateTime={project.publishedAt} className="text-xs">
                          {formatDate(project.publishedAt)}
                        </time>
                      </div>
                    )}

                    {/* Reading time */}
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">{readingTime} min read</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary/90 hover:bg-primary px-4 py-2.5 rounded-md group-hover:gap-3 transition-all w-fit">
                    <span>Read article</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
