import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? Number.parseFloat(price) : price;
  return `${num.toFixed(2)} EGP`;
}

export function formatOrderNumber(orderNumber: number | null | undefined): string {
  if (orderNumber == null || typeof orderNumber !== "number" || !Number.isFinite(orderNumber)) {
    return "Order unavailable";
  }
  return `ORD-${orderNumber}`;
}

export function parseOrderNumber(input: string): number | null {
  const cleaned = input.trim();
  const match = cleaned.match(/^(?:ORD-)?(\d+)$/i);
  if (!match) return null;
  const num = Number.parseInt(match[1], 10);
  return Number.isFinite(num) ? num : null;
}
