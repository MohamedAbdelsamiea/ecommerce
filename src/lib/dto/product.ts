import { type Prisma } from "@prisma/client";

type ProductRaw = Prisma.ProductGetPayload<{}>;

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeProduct(product: ProductRaw): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    images: product.images,
    category: product.category,
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function serializeProductList(products: ProductRaw[]): ProductDTO[] {
  return products.map(serializeProduct);
}
