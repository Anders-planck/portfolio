'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Briefcase, GraduationCap, Rocket, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface TimelineProject {
  title: string;
  period: string;
  description: string;
  technologies: string[];
  achievements?: string[];
  metrics?: string[];
  isOngoing?: boolean;
}

export interface TimelineItem {
  type: 'work' | 'education' | 'project';
  title: string;
  organization: string;
  period: string;
  description: string;
  location?: string;
  technologies?: string[];
  achievements?: string[];
  metrics?: string[];
  projects?: TimelineProject[];
  isOngoing?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  showProjects?: boolean;
}

export function Timeline({ items, showProjects = false }: TimelineProps) {
  const t = useTranslations('about.timeline');

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'work':
        return Briefcase;
      case 'education':
        return GraduationCap;
      case 'project':
        return Rocket;
      default:
        return Briefcase;
    }
  };

  return (
    <div className="space-y-8">
      {items.map((item, index) => {
        const Icon = getIcon(item.type);
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-[15px] top-[40px] h-[calc(100%+32px)] w-0.5 bg-gradient-to-b from-primary/50 to-muted-foreground/20" />
            )}

            {/* Timeline Item */}
            <div className="flex gap-6">
              {/* Icon */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors',
                    item.isOngoing
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 pb-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {item.organization}
                      </p>
                      {item.location && (
                        <p className="text-sm text-muted-foreground">
                          {item.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground md:whitespace-nowrap">
                      {item.isOngoing ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                      <span className={item.isOngoing ? 'text-primary font-semibold' : ''}>
                        {item.period}
                      </span>
                    </div>
                  </div>

                  <p className="leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Technologies */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {item.achievements && item.achievements.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                      {t('keyAchievements')}
                    </h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {item.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metrics */}
                {item.metrics && item.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {item.metrics.map((metric, i) => (
                      <div
                        key={i}
                        className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                      >
                        {metric}
                      </div>
                    ))}
                  </div>
                )}

                {/* Nested Projects */}
                {showProjects && item.projects && item.projects.length > 0 && (
                  <div className="mt-6 space-y-6 border-l-2 border-dashed border-muted-foreground/20 pl-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('projects', { count: item.projects.length })}
                    </h4>
                    {item.projects.map((project, pIndex) => (
                      <div
                        key={pIndex}
                        className="space-y-3 rounded-lg border bg-card/50 p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-foreground">
                              {project.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {project.isOngoing ? (
                              <>
                                <Clock className="h-3 w-3 text-primary" />
                                <span className="font-semibold text-primary">
                                  {project.period}
                                </span>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3 w-3" />
                                <span>{project.period}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {project.description}
                        </p>

                        {project.achievements && project.achievements.length > 0 && (
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {project.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1 flex h-1 w-1 shrink-0 rounded-full bg-primary" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {project.metrics && project.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.metrics.map((metric, i) => (
                              <span
                                key={i}
                                className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                              >
                                {metric}
                              </span>
                            ))}
                          </div>
                        )}

                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="text-[10px] px-2 py-0"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
