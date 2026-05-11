"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/lib/schemas";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { X } from "lucide-react";

type Props = {
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
  };
};

type FormValues = {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
};

export function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: initialData ?? {
      name: "",
      description: "",
      price: 0,
      images: [],
      category: "",
      stock: 0,
    },
  });

  const [imageText, setImageText] = useState(
    initialData ? initialData.images.join("\n") : ""
  );

  const previewUrls = imageText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  async function onSubmit(data: FormValues) {
    const result = initialData
      ? await updateProduct(initialData.id, data)
      : await createProduct(data);

    if (result.success) {
      toast(initialData ? "Product updated" : "Product created", "success");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast(result.error || "Operation failed", "destructive");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={5} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <Input id="price" type="number" step="0.01" {...register("price")} className="pr-12" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
              EGP
            </span>
          </div>
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register("stock")} />
          {errors.stock && (
            <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} />
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="images">Image URLs (one per line, max 5)</Label>
        <Textarea
          id="images"
          rows={3}
          placeholder="https://example.com/image.jpg"
          value={imageText}
          onChange={(e) => {
            const raw = e.target.value;
            setImageText(raw);
            const parsed = raw
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            setValue("images", parsed, { shouldValidate: true });
          }}
        />
        {errors.images && (
          <p className="text-sm text-red-500 mt-1">{errors.images.message}</p>
        )}

        {previewUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-md bg-muted overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const lines = imageText.split("\n").filter((_, idx) => idx !== i);
                    setImageText(lines.join("\n"));
                  }}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Product"
              : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
