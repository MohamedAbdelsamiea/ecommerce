"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function InlineStatusSelect({
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

  async function handleChange(value: string) {
    const prev = status;
    setStatus(value);
    setUpdating(true);

    const result = await updateOrderStatus(orderId, { status: value });
    if (result.success) {
      toast("Status updated", "success");
      router.refresh();
    } else {
      setStatus(prev);
      toast(result.error || "Failed to update", "destructive");
    }
    setUpdating(false);
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={updating}>
      <SelectTrigger className="w-[120px] h-7 text-xs ml-auto">
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
  );
}
