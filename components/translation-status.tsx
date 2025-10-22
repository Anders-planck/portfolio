'use client'

import { localeFlags, localeNames } from '@/i18n/config'
import type { TranslationStatus as Status } from '@/lib/translation-utils'

interface TranslationStatusProps {
  statuses: Status[]
}

export default function TranslationStatus({ statuses }: TranslationStatusProps) {

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Translation Status</h3>
      <div className="space-y-4">
        {statuses.map((status) => (
          <div key={status.locale} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{localeFlags[status.locale]}</span>
                <span className="font-medium">{localeNames[status.locale]}</span>
                {status.isComplete && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✓ Complete
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              {/* Posts Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posts</span>
                  <span className="font-mono text-xs">
                    {status.postsCount} / {statuses.find(s => s.locale === 'en')?.postsCount || 0}
                    <span className="ml-2 text-muted-foreground">
                      {status.postsPercentage}%
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      status.postsPercentage === 100
                        ? 'bg-green-500'
                        : status.postsPercentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${status.postsPercentage}%` }}
                  />
                </div>
              </div>

              {/* Projects Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-mono text-xs">
                    {status.projectsCount} / {statuses.find(s => s.locale === 'en')?.projectsCount || 0}
                    <span className="ml-2 text-muted-foreground">
                      {status.projectsPercentage}%
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${
                      status.projectsPercentage === 100
                        ? 'bg-green-500'
                        : status.projectsPercentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${status.projectsPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
