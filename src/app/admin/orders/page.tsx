import { prisma } from "@/lib/db";
import { OrdersTable } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const raw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shippingInfo: { select: { name: true, phone: true } },
    },
  });

  const orders = raw.map((o) => ({
    ...o,
    total: Number(o.total),
    createdAt: new Date(o.createdAt),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
