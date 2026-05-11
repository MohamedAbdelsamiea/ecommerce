export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square bg-zinc-200 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-zinc-200 rounded animate-pulse" />
          <div className="h-8 w-1/4 bg-zinc-200 rounded animate-pulse" />
          <div className="border-t pt-4 space-y-2">
            <div className="h-4 w-full bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-zinc-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
