import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/actions/product";
import { ProductGrid } from "@/app/(store)/_components/ProductGrid";
import { CategoryFilter } from "@/app/(store)/_components/CategoryFilter";
import { Pagination } from "@/app/(store)/_components/Pagination";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const title = params.q
    ? `Search results for "${params.q}" | CairoCart`
    : params.category
      ? `${params.category} | CairoCart`
      : "CairoCart — Your Egyptian Store";

  return { title, description: "Browse our collection of products." };
}

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 12;

  const [result, categories] = await Promise.all([
    getProducts({
      search: params.q,
      category: params.category,
      page,
      pageSize,
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {params.q
            ? <>Results for &ldquo;<span className="text-primary">{params.q}</span>&rdquo;</>
            : params.category
              ? params.category
              : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "product" : "products"}
          {params.q && <> found</>}
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-10 rounded-full bg-muted animate-pulse" />}>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {params.q && result.products.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium mb-1">No results for &ldquo;{params.q}&rdquo;</p>
          <p className="text-sm text-muted-foreground">Try a different search term or browse categories above.</p>
        </div>
      )}

      <ProductGrid products={result.products} />

      <div className="mt-12">
        <Suspense fallback={null}>
          <Pagination currentPage={page} totalPages={result.totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
