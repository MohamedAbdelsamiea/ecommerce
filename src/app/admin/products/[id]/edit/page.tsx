import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/app/admin/_components/ProductForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          images: product.images,
          category: product.category,
          stock: product.stock,
        }}
      />
    </div>
  );
}
