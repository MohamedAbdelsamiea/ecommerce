"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { InlineStatusSelect } from "@/app/admin/_components/InlineStatusSelect";
import { Search, X } from "lucide-react";

type OrderItem = {
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  orderNumber: number | null;
  status: string;
  createdAt: Date;
  total: number;
  shippingInfo: { name: string | null; phone: string | null } | null;
  items: OrderItem[];
};

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

export function OrdersTable({ orders: initial }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let result = initial.filter((o) => {
      if (status && o.status !== status) return false;

      if (q) {
        const orderNum = formatOrderNumber(o.orderNumber).toLowerCase();
        const name = (o.shippingInfo?.name ?? "").toLowerCase();
        const phone = (o.shippingInfo?.phone ?? "").toLowerCase();
        if (
          !orderNum.includes(q) &&
          !name.includes(q) &&
          !phone.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return result;
  }, [initial, search, status, sort]);

  const hasFilters = search || status;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by order, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          {hasFilters ? (
            <>
              <p className="text-zinc-500 mb-4">No orders match your filters</p>
              <Button
                variant="outline"
                onClick={() => { setSearch(""); setStatus(""); }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </>
          ) : (
            <p className="text-zinc-500">No orders yet</p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Order</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Customer</th>
                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Date</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Items</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Total</th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 font-medium align-middle">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 align-middle">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:text-zinc-600"
                    >
                      {formatOrderNumber(order.orderNumber)}
                    </Link>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 align-middle">
                    <div className="text-sm">{order.shippingInfo?.name || "—"}</div>
                    {order.shippingInfo?.phone && (
                      <div className="text-xs text-zinc-400">{order.shippingInfo.phone}</div>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-zinc-500 text-xs whitespace-nowrap align-middle">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-zinc-500 align-middle">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium whitespace-nowrap align-middle">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right align-middle">
                    <InlineStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}