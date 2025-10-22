import { getPosts, PostMetadata } from '@/lib/posts';
import { getProjects, ProjectMetadata } from '@/lib/projects';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, ArrowRight, FileText, FolderGit2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type ContentItem = {
  type: 'post' | 'project';
  metadata: PostMetadata | ProjectMetadata;
};

export default async function RecentContent({ locale }: { locale: string }) {
  const t = await getTranslations("components.recentContent");
  const posts = await getPosts(2);
  const projects = await getProjects(2);

  // Mix posts and projects together, alternating
  const content: ContentItem[] = [];
  const maxLength = Math.max(posts.length, projects.length);

  for (let i = 0; i < maxLength; i++) {
    if (posts[i]) {
      content.push({ type: 'post', metadata: posts[i] });
    }
    if (projects[i]) {
      content.push({ type: 'project', metadata: projects[i] });
    }
  }

  const getReadingTime = (summary?: string) => {
    if (!summary) return 1;
    const words = summary.split(' ').length;
    return Math.max(1, Math.ceil(words / 50));
  };

  const getAuthorInitials = (author?: string) => {
    return author
      ? author
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'AP';
  };

  return (
    <section className="pb-24">
      <div>
        <h2 className="title mb-12">{t("title")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.map((item, index) => {
            const readingTime = getReadingTime(item.metadata.summary);
            const authorInitials = getAuthorInitials(item.metadata.author);
            const isPost = item.type === 'post';
            const href = isPost
              ? `/posts/${item.metadata.slug}`
              : `/projects/${item.metadata.slug}`;

            return (
              <Card
                key={`${item.type}-${item.metadata.slug}-${index}`}
                className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 flex flex-col p-0"
              >
                <Link href={href} className="flex flex-col flex-1">
                  {/* Image for projects */}
                  {!isPost && item.metadata.image && (
                    <div className="relative w-full h-48 overflow-hidden bg-muted">
                      <Image
                        src={item.metadata.image}
                        alt={item.metadata.title || 'Project Image'}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <CardHeader className="space-y-4 flex-1 py-4">
                    <div className="space-y-3">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2">
                        {isPost ? (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {t("postBadge")}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs flex items-center gap-1">
                            <FolderGit2 className="h-3 w-3" />
                            {t("projectBadge")}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.metadata.title}
                      </CardTitle>
                      {item.metadata.summary && (
                        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                          {item.metadata.summary}
                        </CardDescription>
                      )}
                    </div>

                    {/* Tags */}
                    {item.metadata.tags && item.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.metadata.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs font-medium px-2.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.metadata.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                            +{item.metadata.tags.length - 3}
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
                      {item.metadata.author && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={undefined} alt={item.metadata.author} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground/90">
                            {item.metadata.author}
                          </span>
                        </div>
                      )}

                      {/* Date */}
                      {item.metadata.publishedAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={item.metadata.publishedAt} className="text-xs">
                            {formatDate(item.metadata.publishedAt, locale)}
                          </time>
                        </div>
                      )}

                      {/* Reading time */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">{readingTime} {t("minRead")}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 px-6 pb-6 mt-auto">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      <span>{isPost ? t("readArticle") : t("readMore")}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Links to all posts and projects */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground underline"
          >
            <FileText className="h-4 w-4" />
            <span>{t("allPosts")}</span>
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground underline"
          >
            <FolderGit2 className="h-4 w-4" />
            <span>{t("allProjects")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
