export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse mb-8" />
      <div className="rounded-lg border bg-white p-6 space-y-4 mb-8">
        <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse mb-1" />
            <div className="h-9 w-full bg-zinc-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
