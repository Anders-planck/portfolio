export default function Loading() {
  return (
    <section className="pb-24 pt-44 md:pt-40">
      <div className="container max-w-4xl">
        {/* Page title skeleton */}
        <div className="mb-12 flex items-center gap-4">
          <div className="relative h-10 w-48 overflow-hidden rounded-lg bg-muted dark:bg-muted/50">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/10" />
          </div>
        </div>

        {/* Post cards skeleton */}
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Title skeleton */}
              <div className="mb-4 space-y-3">
                <div className="relative h-7 w-3/4 overflow-hidden rounded bg-muted dark:bg-muted/50">
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                </div>

                {/* Summary skeleton */}
                <div className="space-y-2">
                  <div className="relative h-4 w-full overflow-hidden rounded bg-muted/80 dark:bg-muted/40">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                      style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                    />
                  </div>
                  <div className="relative h-4 w-5/6 overflow-hidden rounded bg-muted/80 dark:bg-muted/40">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                      style={{ animationDelay: `${i * 0.2 + 0.2}s` }}
                    />
                  </div>
                </div>

                {/* Tags skeleton */}
                <div className="flex gap-2 pt-2">
                  <div className="relative h-6 w-16 overflow-hidden rounded-full bg-muted/60 dark:bg-muted/30">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                      style={{ animationDelay: `${i * 0.2 + 0.3}s` }}
                    />
                  </div>
                  <div className="relative h-6 w-20 overflow-hidden rounded-full bg-muted/60 dark:bg-muted/30">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                      style={{ animationDelay: `${i * 0.2 + 0.4}s` }}
                    />
                  </div>
                  <div className="relative h-6 w-24 overflow-hidden rounded-full bg-muted/60 dark:bg-muted/30">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                      style={{ animationDelay: `${i * 0.2 + 0.5}s` }}
                    />
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="my-4 h-px bg-border" />

              {/* Metadata skeleton */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative h-7 w-7 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                    style={{ animationDelay: `${i * 0.2 + 0.6}s` }}
                  />
                </div>

                {/* Author name */}
                <div className="relative h-4 w-24 overflow-hidden rounded bg-muted/70 dark:bg-muted/35">
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                    style={{ animationDelay: `${i * 0.2 + 0.7}s` }}
                  />
                </div>

                {/* Date */}
                <div className="relative h-4 w-20 overflow-hidden rounded bg-muted/70 dark:bg-muted/35">
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                    style={{ animationDelay: `${i * 0.2 + 0.8}s` }}
                  />
                </div>

                {/* Reading time */}
                <div className="relative h-4 w-16 overflow-hidden rounded bg-muted/70 dark:bg-muted/35">
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/15"
                    style={{ animationDelay: `${i * 0.2 + 0.9}s` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
