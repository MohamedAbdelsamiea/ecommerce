import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { UpdateOrderStatus } from "./UpdateOrderStatus";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      shippingInfo: true,
    },
  });

  if (!order) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{formatOrderNumber(order.orderNumber)}</h1>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Order Status</h2>
            <StatusBadge status={order.status} />
          </div>
          <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Product</th>
                <th className="text-right py-2 font-medium">Qty</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-2">{item.product.name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(Number(item.price))}</td>
                  <td className="py-2 text-right font-medium">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 text-right font-semibold">
                  Total
                </td>
                <td className="pt-4 text-right font-bold">
                  {formatPrice(Number(order.total))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {order.shippingInfo && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex">
                <dt className="w-24 text-zinc-500">Name</dt>
                <dd>{order.shippingInfo.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-zinc-500">Phone</dt>
                <dd>{order.shippingInfo.phone}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-zinc-500">Address</dt>
                <dd>{order.shippingInfo.address}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-zinc-500">City</dt>
                <dd>{order.shippingInfo.city}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
