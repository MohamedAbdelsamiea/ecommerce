import { z } from "zod";

export const shippingInfoSchema = z.object({
  email: z.string().email("Valid email is required").transform((v) => v.trim().toLowerCase()),
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(1, "Phone is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
});

export type ShippingInfoInput = z.infer<typeof shippingInfoSchema>;
