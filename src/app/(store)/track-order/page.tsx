import { TrackOrderForm } from "./TrackOrderForm";
import { auth } from "@/lib/auth";
import { Package } from "lucide-react";

export const metadata = {
  title: "Track Order - CairoCart",
  description: "Look up your order status using your order number and email address.",
};

type Props = {
  searchParams: Promise<{ orderno?: string; email?: string }>;
};

export default async function TrackOrderPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  const initialOrderNo = params.orderno ? Number(params.orderno) : undefined;
  const hasPrefill = session?.user
    ? !!initialOrderNo
    : !!(initialOrderNo && params.email);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      {!hasPrefill && (
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Track Your Order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your order number and the email address you used at checkout to see your order status.
          </p>
        </div>
      )}
      <div className="rounded-xl border border-border bg-white p-6">
        <TrackOrderForm
          isAuthenticated={!!session?.user}
          userId={session?.user?.id}
          initialOrderNo={initialOrderNo}
          initialEmail={params.email}
        />
      </div>
    </div>
  );
}
