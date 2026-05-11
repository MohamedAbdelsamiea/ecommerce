import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { OrderDTO } from "@/lib/dto/order";

export function OrderTable({ orders }: { orders: OrderDTO[] }) {
  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-zinc-50">
            <th className="text-left px-4 py-3 font-medium">Order ID</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-right px-4 py-3 font-medium">Total</th>
            <th className="text-right px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-b-0 hover:bg-zinc-50">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-xs font-medium hover:text-zinc-600"
                >
                  {order.id.slice(0, 8)}...
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatPrice(order.total)}
              </td>
              <td className="px-4 py-3 text-right">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
