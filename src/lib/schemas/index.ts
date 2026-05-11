export {
  createProductSchema,
  updateProductSchema,
} from "./product";
export type { CreateProductInput, UpdateProductInput } from "./product";

export {
  createOrderSchema,
  updateOrderStatusSchema,
  cartItemSchema,
} from "./order";
export type { CreateOrderInput, UpdateOrderStatusInput } from "./order";

export { shippingInfoSchema } from "./shipping";
export type { ShippingInfoInput } from "./shipping";
