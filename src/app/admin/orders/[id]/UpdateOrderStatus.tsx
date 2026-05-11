"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleUpdate() {
    if (status === currentStatus) return;
    setUpdating(true);
    const result = await updateOrderStatus(orderId, { status });
    if (result.success) {
      toast("Order status updated", "success");
      router.refresh();
    } else {
      toast(result.error || "Failed to update", "destructive");
      setUpdating(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={updating || status === currentStatus} size="sm">
        {updating ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
