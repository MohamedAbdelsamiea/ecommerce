"use server";

import { prisma } from "@/lib/db";
import { createProductSchema, updateProductSchema, updateOrderStatusSchema } from "@/lib/schemas";
import { generateUniqueSlug } from "@/lib/slug";
import type { ActionResponse } from "@/types";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function createProduct(
  input: unknown
): Promise<ActionResponse<{ id: string }>> {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid product data" };
  }

  const data = parsed.data;
  const slug = await generateUniqueSlug(data.name);

  try {
    const product = await prisma.product.create({
      data: { ...data, slug },
    });
    logger.info("Product created", { productId: product.id });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: { id: product.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    logger.error("Product creation failed", { error: message });
    return { success: false, error: message };
  }
}

export async function updateProduct(
  id: string,
  input: unknown
): Promise<ActionResponse<void>> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid product data" };
  }

  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
    logger.info("Product updated", { productId: id });
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath(`/products/[slug]`);
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    logger.error("Product update failed", { error: message });
    return { success: false, error: message };
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse<void>> {
  try {
    await prisma.product.delete({ where: { id } });
    logger.info("Product deleted", { productId: id });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    logger.error("Product deletion failed", { error: message });
    return { success: false, error: message };
  }
}

export async function updateOrderStatus(
  id: string,
  input: unknown
): Promise<ActionResponse<void>> {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid status" };
  }

  try {
    const status = parsed.data.status;
    const data: Parameters<typeof prisma.order.update>[0]["data"] = { status };

    if (status === "CONFIRMED") data.confirmedAt = new Date();
    if (status === "SHIPPED") data.shippedAt = new Date();
    if (status === "DELIVERED") data.deliveredAt = new Date();

    await prisma.order.update({ where: { id }, data });
    logger.info("Order status updated", { orderId: id, status });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    logger.error("Order status update failed", { error: message });
    return { success: false, error: message };
  }
}
