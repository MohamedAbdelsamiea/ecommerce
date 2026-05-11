"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function handleSelect(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const allLabel = "All";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect("")}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          !active
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        )}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleSelect(category)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            active === category
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
