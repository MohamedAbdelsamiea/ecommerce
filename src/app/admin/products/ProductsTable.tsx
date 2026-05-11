"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteProductButton } from "./DeleteProductButton";
import { Search, X } from "lucide-react";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
};

export function ProductsTable({ products: initial }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(initial.map((p) => p.category))].sort(),
    [initial]
  );

  const filtered = useMemo(() => {
    return initial.filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) {
        return false;
      }
      if (category && p.category !== category) return false;
      return true;
    });
  }, [initial, search, category]);

  const hasFilters = search || category;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          {hasFilters ? (
            <>
              <p className="text-zinc-500 mb-4">No products match your filters</p>
              <Button
                variant="outline"
                onClick={() => { setSearch(""); setCategory(""); }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-zinc-500 mb-4">No products yet</p>
              <Button asChild variant="outline">
                <Link href="/admin/products/new">Create your first product</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium">Product</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium">Category</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium">Price</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium">Stock</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-md bg-muted overflow-hidden relative">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-300 text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium hover:text-zinc-600"
                      >
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-zinc-500">{product.category}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">{formatPrice(product.price)}</td>
                  <td className={`px-2 sm:px-4 py-2 sm:py-3 text-right ${
                    product.stock < 10 ? "text-amber-600 font-semibold" : ""
                  }`}>
                    {product.stock}
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="ml-1 text-[10px] text-amber-500">low</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
