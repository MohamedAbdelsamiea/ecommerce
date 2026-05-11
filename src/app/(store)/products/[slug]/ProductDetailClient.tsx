"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Minus, Plus, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
  };
};

export function ProductDetailClient({ product }: Props) {
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const { toast } = useToast();
  const router = useRouter();

  function addToCart() {
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
    toast(`${qty}x ${product.name} added to cart`, "success");
  }

  function buyNow() {
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category + Name */}
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{product.category}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">{product.name}</h1>
      </div>

      {/* Price */}
      <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

      {/* Description */}
      <div className="border-t border-border pt-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      {product.stock > 0 ? (
        <>
          {/* Stock + Quantity grouped */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
              <span className="font-medium text-green-700">{product.stock} in stock</span>
              {product.stock <= 5 && (
                <span className="text-amber-600 text-xs font-medium">— Only {product.stock} left</span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2.5 block text-foreground">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={buyNow} size="lg" className="flex-1 py-3 sm:py-2.5 min-h-[48px] sm:min-h-11">
              <Zap className="h-4 w-4" />
              Buy Now
            </Button>
            <Button onClick={addToCart} variant="outline" size="lg" className="flex-1 py-3 sm:py-2.5 min-h-[48px] sm:min-h-11">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </>
      ) : (
        <div className="border-t border-border pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
            Out of stock
          </span>
        </div>
      )}

      {/* Trust badge panel */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Free Delivery</p>
            <p className="text-xs text-muted-foreground">On orders over 500 EGP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <RefreshCw className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Easy Returns</p>
            <p className="text-xs text-muted-foreground">14-day return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Secure Checkout</p>
            <p className="text-xs text-muted-foreground">Pay on delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
