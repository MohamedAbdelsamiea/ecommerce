import { type Prisma } from "@prisma/client";

type OrderRaw = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: { product: true };
    };
    shippingInfo: true;
  };
}>;

type OrderItemDTO = {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  productName: string;
};

type ShippingInfoDTO = {
  name: string;
  phone: string;
  address: string;
  city: string;
} | null;

export type OrderDTO = {
  id: string;
  total: number;
  status: string;
  items: OrderItemDTO[];
  shippingInfo: ShippingInfoDTO;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeOrder(order: OrderRaw): OrderDTO {
  return {
    id: order.id,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      productId: item.productId,
      productName: item.product.name,
    })),
    shippingInfo: order.shippingInfo
      ? {
          name: order.shippingInfo.name,
          phone: order.shippingInfo.phone,
          address: order.shippingInfo.address,
          city: order.shippingInfo.city,
        }
      : null,
  };
}

export function serializeOrderList(orders: OrderRaw[]): OrderDTO[] {
  return orders.map(serializeOrder);
}
