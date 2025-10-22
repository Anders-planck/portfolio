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

        {/* Project cards skeleton - Grid layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
              style={{
                height: '400px',
              }}
            >
              {/* Image skeleton */}
              <div className="relative h-full w-full overflow-hidden bg-muted dark:bg-muted/50">
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-primary/25 to-transparent dark:via-primary/15"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />

                {/* Overlay content skeleton - appears on hover in real component */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Top section */}
                  <div className="space-y-4">
                    {/* Title skeleton */}
                    <div className="relative h-7 w-4/5 overflow-hidden rounded bg-white/20 dark:bg-black/30">
                      <div
                        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    </div>

                    {/* Summary lines */}
                    <div className="space-y-2">
                      <div className="relative h-4 w-full overflow-hidden rounded bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                        />
                      </div>
                      <div className="relative h-4 w-3/4 overflow-hidden rounded bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.2}s` }}
                        />
                      </div>
                    </div>

                    {/* Tags skeleton */}
                    <div className="flex gap-2">
                      <div className="relative h-6 w-16 overflow-hidden rounded-full bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.3}s` }}
                        />
                      </div>
                      <div className="relative h-6 w-20 overflow-hidden rounded-full bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.4}s` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className="space-y-3">
                    {/* Metadata */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-7 w-7 overflow-hidden rounded-full bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.5}s` }}
                        />
                      </div>
                      <div className="relative h-4 w-20 overflow-hidden rounded bg-white/20 dark:bg-black/30">
                        <div
                          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                          style={{ animationDelay: `${i * 0.2 + 0.6}s` }}
                        />
                      </div>
                    </div>

                    {/* CTA button skeleton */}
                    <div className="relative h-10 w-32 overflow-hidden rounded bg-white/20 dark:bg-black/30">
                      <div
                        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-primary/25"
                        style={{ animationDelay: `${i * 0.2 + 0.7}s` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Default state - title at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 group-hover:opacity-0 dark:from-black/80">
                  <div className="relative h-7 w-3/4 overflow-hidden rounded bg-white/30 dark:bg-white/20">
                    <div
                      className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-primary/25"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
