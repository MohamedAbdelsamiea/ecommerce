export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse" />
      <div className="rounded-lg border bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0">
            <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse ml-auto" />
            <div className="h-4 w-12 bg-zinc-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
