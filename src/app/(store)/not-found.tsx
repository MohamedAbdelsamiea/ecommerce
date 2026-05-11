import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-sm text-zinc-500 mb-6">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Go home
      </Link>
    </div>
  );
}
