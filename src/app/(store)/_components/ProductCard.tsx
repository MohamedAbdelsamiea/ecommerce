"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import type { ProductDTO } from "@/lib/dto/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/ui/toast";

export function ProductCard({ product }: { product: ProductDTO }) {
  const addItem = useCart((s) => s.addItem);
  const { toast } = useToast();

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
    toast(`Added ${product.name} to cart`, "success");
  }

  return (
    <div className="group relative rounded-xl border border-border bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-xl bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">Out of stock</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-2 left-2 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>
      </Link>

      {/* Quick add button — appears on hover */}
      {product.stock > 0 && (
        <button
          onClick={handleQuickAdd}
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-90"
          aria-label={`Quick add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      )}

      <Link href={`/products/${product.slug}`}>
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
          <h3 className="mt-1 font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-base font-bold text-foreground">{formatPrice(product.price)}</p>
            {product.stock > 0 && (
              <span className="text-[11px] text-green-600 font-medium">In stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
