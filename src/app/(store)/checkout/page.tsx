import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Checkout</h1>
      <p className="text-muted-foreground mb-8">Complete your order</p>
      <CheckoutForm />
    </div>
  );
}
