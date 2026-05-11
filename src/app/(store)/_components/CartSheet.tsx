"use client";

import { ShoppingCart, Trash2, Minus, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const FREE_SHIPPING_THRESHOLD = 500;

export function CartSheet() {
  const { items, itemCount, total, removeItem, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleCheckout() {
    setOpen(false);
    router.push("/checkout");
  }

  const cartTotal = total();
  const shippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted">
          <ShoppingCart className="h-5 w-5" />
          {mounted && itemCount() > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Add some products to get started</p>
            <Link
              href="/"
              className="mt-6 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Browse products &rarr;
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col h-[calc(100vh-180px)]">
            {/* Free shipping progress */}
            <div className="mb-4 p-3 rounded-lg bg-muted/50">
              {shippingProgress >= 100 ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Truck className="h-4 w-4" />
                  You qualify for free delivery!
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Free delivery</span>
                    <span>{formatPrice(freeShippingRemaining)} away</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 rounded-lg border border-border">
                  <div className="h-20 w-20 shrink-0 rounded-lg bg-muted overflow-hidden relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-muted-foreground hover:text-red-500 self-start p-1 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Cash on Delivery</p>
              <Button onClick={handleCheckout} className="w-full text-base py-5">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
