export default function Loading() {
  return (
    <section className="pb-24 pt-44 md:pt-40">
      <div className="container max-w-4xl">
        <div className="mb-12 h-10 w-32 animate-pulse rounded-lg bg-muted" />

        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
