"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/schemas/order";
import type { ActionResponse } from "@/types";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createOrder(
  input: unknown
): Promise<ActionResponse<{ orderId: string; orderNumber: number }>> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid order data" };
  }

  const { items, shippingInfo } = parsed.data;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;

      const orderItems = await Promise.all(
        items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${product.stock}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

          const lineTotal = Number(product.price) * item.quantity;
          total += lineTotal;

          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      const order = await tx.order.create({
        data: {
          total,
          ...(userId ? { userId } : {}),
          items: {
            create: orderItems,
          },
          shippingInfo: {
            create: shippingInfo,
          },
        },
        include: {
          items: { include: { product: { select: { name: true } } } },
          shippingInfo: { select: { email: true } },
        },
      });

      return order;
    });

    logger.info("Order created", { orderId: result.id, orderNumber: result.orderNumber });
    revalidatePath("/");

    return { success: true, data: { orderId: result.id, orderNumber: result.orderNumber } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    logger.error("Order creation failed", { error: message });
    return { success: false, error: message };
  }
}
