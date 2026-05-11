import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function OrderDetailRedirectPage({ params }: Props) {
  const session = await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true, userId: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  redirect(`/track-order?orderno=${order.orderNumber}`);
}
