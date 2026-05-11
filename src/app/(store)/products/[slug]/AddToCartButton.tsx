"use client";

import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type ProductProps = {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
};

export function AddToCartButton({ product }: ProductProps) {
  const addItem = useCart((s) => s.addItem);
  const { toast } = useToast();

  function handleAdd() {
    if (product.stock === 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
    toast(`${product.name} added to cart`, "success");
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={product.stock === 0}
      size="lg"
      className="w-full sm:w-auto"
    >
      <ShoppingCart className="h-4 w-4" />
      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
