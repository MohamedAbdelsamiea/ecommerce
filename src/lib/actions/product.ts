import "server-only";

import { prisma } from "@/lib/db";
import { cache } from "react";

export const getProducts = cache(async (params: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { search, category, page = 1, pageSize = 12 } = params;

  const where: Record<string, unknown> = {};

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  if (category) {
    where.category = category;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
    })),
    total,
    totalPages: Math.ceil(total / pageSize),
  };
});

export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return null;
  return { ...product, price: Number(product.price) };
});

export const getCategories = cache(async () => {
  const result = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return result.map((r) => r.category);
});

export const getFeaturedProducts = cache(async () => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));
});
