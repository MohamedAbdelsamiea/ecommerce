import { prisma } from "@/lib/db";
import { ProductsTable } from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <ProductsTable
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          images: p.images,
          category: p.category,
          stock: p.stock,
        }))}
      />
    </div>
  );
}
