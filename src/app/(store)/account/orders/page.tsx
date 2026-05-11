import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { requireAuth } from "@/lib/authorize";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const session = await requireAuth();
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-lg font-medium mb-1">No orders yet</p>
        <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:brightness-110 transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-4">Order History</h2>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/track-order?orderno=${order.orderNumber}`}
          className="block rounded-xl bg-white shadow-sm border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">{formatOrderNumber(order.orderNumber)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
              order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
              order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
              order.status === "CONFIRMED" ? "bg-amber-100 text-amber-700" :
              "bg-zinc-100 text-zinc-700"
            }`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
            <span className="font-semibold">{formatPrice(Number(order.total))}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
