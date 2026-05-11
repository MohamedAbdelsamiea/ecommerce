import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { requireAuth } from "@/lib/authorize";
import { ProfileForm } from "./ProfileForm";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) notFound();

  const [orderCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center gap-5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">{user.name || "No name set"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {orderCount} order{orderCount !== 1 ? "s" : ""} placed
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border-2 border-dashed border-muted p-5 text-center text-sm text-muted-foreground">
          Profile image upload coming soon
        </div>
      </div>

      {/* Recent orders summary */}
      {recentOrders.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link
              href="/account/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
              {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/track-order?orderno=${o.orderNumber}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{formatOrderNumber(o.orderNumber)}</p>
                    <p className="text-xs text-muted-foreground">{o.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPrice(Number(o.total))}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    o.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                    o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                    o.status === "CONFIRMED" ? "bg-amber-100 text-amber-700" :
                    "bg-zinc-100 text-zinc-700"
                  }`}>
                    {o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit profile */}
      <ProfileForm user={{ id: user.id, name: user.name, email: user.email }} />
    </div>
  );
}
