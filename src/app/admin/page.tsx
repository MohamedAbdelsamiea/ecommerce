import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Package, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    productCount,
    orderCount,
    revenueResult,
    monthlyRevenueResult,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: firstOfMonth } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        shippingInfo: { select: { name: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.total ?? 0);
  const monthlyRevenue = Number(monthlyRevenueResult._sum.total ?? 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Monthly Revenue</p>
              <p className="text-xl font-bold">{formatPrice(monthlyRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl font-bold">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Products</p>
              <p className="text-xl font-bold">{productCount}</p>
            </div>
          </div>
          <Link href="/admin/products" className="mt-3 inline-block text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
            Manage products &rarr;
          </Link>
        </div>
        <div className="rounded-lg border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Orders</p>
              <p className="text-xl font-bold">{orderCount}</p>
            </div>
          </div>
          <Link href="/admin/orders" className="mt-3 inline-block text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
            Manage orders &rarr;
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <div className="rounded-lg border bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b bg-zinc-50">
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium">Order</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium">Customer</th>
                  <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium">Date</th>
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium">Total</th>
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-zinc-50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:text-zinc-600"
                      >
                        {formatOrderNumber(order.orderNumber)}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-zinc-600">
                      {order.shippingInfo?.name || "—"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-zinc-500 text-xs">
                      {relativeTime(order.createdAt)}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
