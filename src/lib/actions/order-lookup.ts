"use server";

import { prisma } from "@/lib/db";

export type LookupResult = {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  createdAt: Date;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  items: { product: { name: string }; quantity: number; price: number }[];
  shippingInfo: { name: string; address: string; city: string } | null;
};

export async function lookupOrderByNumber(
  orderNumber: number,
  email: string
): Promise<{ success: true; order: LookupResult } | { success: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!orderNumber || !normalizedEmail) {
    return { success: false, error: "Order number and email are required" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { select: { name: true } } } },
        shippingInfo: { select: { email: true, name: true, address: true, city: true } },
      },
    });

    if (!order || order.shippingInfo?.email !== normalizedEmail) {
      return { success: false, error: "Order not found or email does not match" };
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        items: order.items.map((i) => ({
          product: { name: i.product.name },
          quantity: i.quantity,
          price: Number(i.price),
        })),
        shippingInfo: order.shippingInfo,
      },
    };
  } catch {
    return { success: false, error: "Failed to look up order" };
  }
}

export async function lookupOrderByUser(
  orderNumber: number,
  userId: string
): Promise<{ success: true; order: LookupResult } | { success: false; error: string }> {
  if (!orderNumber || !userId) {
    return { success: false, error: "Order number is required" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: { select: { name: true } } } },
        shippingInfo: { select: { email: true, name: true, address: true, city: true } },
      },
    });

    if (!order || order.userId !== userId) {
      return { success: false, error: "Order not found" };
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        items: order.items.map((i) => ({
          product: { name: i.product.name },
          quantity: i.quantity,
          price: Number(i.price),
        })),
        shippingInfo: order.shippingInfo,
      },
    };
  } catch {
    return { success: false, error: "Failed to look up order" };
  }
}
