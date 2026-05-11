"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lookupOrderByNumber, lookupOrderByUser, type LookupResult } from "@/lib/actions/order-lookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { formatPrice, formatOrderNumber, parseOrderNumber, cn } from "@/lib/utils";
import { Search, Package, Check } from "lucide-react";
import Link from "next/link";

const STATUS_ORDER = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
};

function OrderProgress({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus as typeof STATUS_ORDER[number]);

  return (
    <div className="relative">
      {/* Background track line */}
      <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-muted" />
      {/* Progress fill line */}
      <div
        className="absolute top-3.5 left-6 h-0.5 bg-primary transition-all duration-500"
        style={{ width: currentIdx > 0 ? `calc((100% - 48px) * ${currentIdx / (STATUS_ORDER.length - 1)})` : "0px" }}
      />
      <div className="relative flex items-start justify-between">
        {STATUS_ORDER.map((status, i) => {
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={status} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrackOrderForm({
  isAuthenticated,
  userId,
  initialOrderNo,
  initialEmail,
}: {
  isAuthenticated: boolean;
  userId?: string;
  initialOrderNo?: number;
  initialEmail?: string;
}) {
  const router = useRouter();
  const [orderInput, setOrderInput] = useState(initialOrderNo ? formatOrderNumber(initialOrderNo) : "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<LookupResult | null>(null);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const { toast } = useToast();

  // Auto-load: authenticated users by userId, guests by email
  useEffect(() => {
    if (initialOrderNo && !autoLoaded) {
      setAutoLoaded(true);
      setLoading(true);

      const lookup = userId
        ? lookupOrderByUser(initialOrderNo, userId)
        : initialEmail
          ? lookupOrderByNumber(initialOrderNo, initialEmail)
          : null;

      if (!lookup) { setLoading(false); return; }

      lookup.then((result) => {
        if (result.success) {
          setOrder(result.order);
          window.history.replaceState({}, "", "/track-order");
        } else {
          toast("Could not load order details. Please try searching manually.", "destructive");
        }
        setLoading(false);
      });
    }
  }, [initialOrderNo, initialEmail, userId, autoLoaded, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOrder(null);

    const parsed = parseOrderNumber(orderInput);
    if (parsed === null) {
      toast("Please enter a valid order number (e.g. ORD-1024 or 1024)", "destructive");
      setLoading(false);
      return;
    }

    const result = await lookupOrderByNumber(parsed, email.trim());
    if (result.success) {
      setOrder(result.order);
    } else {
      toast(result.error, "destructive");
    }
    setLoading(false);
  }, [orderInput, email, toast]);

  const handleReset = useCallback(() => {
    setOrder(null);
    setOrderInput("");
    setEmail("");
    router.push("/track-order");
  }, [router]);

  if (loading && !order) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-20 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    );
  }

  if (order) {
    const currentIdx = STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]);

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{formatOrderNumber(order.orderNumber)}</h2>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-zinc-100 text-zinc-800"}`}>
              {order.status}
            </span>
          </div>

          <OrderProgress currentStatus={order.status} />

          {(order.confirmedAt || order.shippedAt || order.deliveredAt) && (
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              {order.confirmedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed</span>
                  <span>{new Date(order.confirmedAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipped</span>
                  <span>{new Date(order.shippedAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.product.name} x{item.quantity}</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>

          {order.shippingInfo && (
            <div className="border-t border-border pt-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Shipping to</p>
              <p>{order.shippingInfo.name}</p>
              <p>{order.shippingInfo.address}, {order.shippingInfo.city}</p>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-sm">
            <p className="font-medium text-foreground mb-1">Want to track all your orders?</p>
            <p className="text-muted-foreground mb-3">
              Sign up to link this order to your account and view all your orders in one place.
            </p>
            <Button asChild size="sm">
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-3">
          {!initialOrderNo && (
            <Button variant="secondary" onClick={handleReset}>
              Track another order
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="orderNo">Order Number</Label>
        <Input
          id="orderNo"
          value={orderInput}
          onChange={(e) => setOrderInput(e.target.value)}
          placeholder="e.g. ORD-1024 or 1024"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email used at checkout</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Looking up..." : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Track Order
          </>
        )}
      </Button>
    </form>
  );
}
