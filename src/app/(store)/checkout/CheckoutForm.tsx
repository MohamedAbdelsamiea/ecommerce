"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingInfoSchema, type ShippingInfoInput } from "@/lib/schemas";
import { createOrder } from "@/lib/actions/order";
import { useCart } from "@/store/cart";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronRight, Check, CheckCircle } from "lucide-react";

const STEPS = ["Cart", "Information", "Confirmation"];

type PlacedState = { orderId: string; orderNumber: number; email: string; name: string };

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedState | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInfoInput>({
    resolver: zodResolver(shippingInfoSchema),
  });

  if (placed) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between max-w-md">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{step}</span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-white p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Order Placed!</h2>
          <p className="text-sm font-medium mb-4">
            {formatOrderNumber(placed.orderNumber)}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You can track your order and view real-time progress using the link below.
          </p>

          <div className="border-t border-border pt-4 mb-4 text-left space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href={`/track-order?orderno=${placed.orderNumber}&email=${encodeURIComponent(placed.email)}`}>View Order Details</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-1">Your cart is empty</p>
        <p className="text-sm text-muted-foreground mb-6">Add some products before checking out</p>
        <Button asChild>
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: ShippingInfoInput) {
    setSubmitting(true);
    try {
      const result = await createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingInfo: data,
      });

      if (!result.success) {
        toast(result.error || "Failed to create order", "destructive");
        return;
      }

      clearCart();
      setPlaced({ orderId: result.data.orderId, orderNumber: result.data.orderNumber, email: data.email, name: data.name });
    } catch {
      toast("Something went wrong. Please try again.", "destructive");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Main form */}
      <div className="lg:col-span-3 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between max-w-md">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i <= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${
                i <= 1 ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-1" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              Shipping Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  {...register("name")}
                  className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                  placeholder="Ahmed Ali"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
                  placeholder="0100 123 4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  rows={3}
                  {...register("address")}
                  className={errors.address ? "border-red-400 focus-visible:ring-red-400" : ""}
                  placeholder="Street, building, apartment number..."
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city")}
                  className={errors.city ? "border-red-400 focus-visible:ring-red-400" : ""}
                  placeholder="Cairo"
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full text-base py-5 min-h-[48px] lg:hidden">
            {submitting ? "Placing Order..." : `Place Order — ${formatPrice(total())}`}
          </Button>
        </form>
      </div>

      {/* Order summary sidebar */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-muted overflow-hidden relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(total())}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pay on delivery — Cash only</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Button type="submit" disabled={submitting} className="w-full text-base py-5 min-h-[48px] hidden lg:inline-flex">
              {submitting ? "Placing Order..." : `Place Order — ${formatPrice(total())}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
