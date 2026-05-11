import type { ProductDTO } from "@/lib/dto/product";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
