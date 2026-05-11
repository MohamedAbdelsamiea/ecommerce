export default function StoreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white overflow-hidden">
            <div className="aspect-square bg-zinc-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-zinc-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
