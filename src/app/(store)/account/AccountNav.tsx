"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag } from "lucide-react";

const links = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Order History", icon: ShoppingBag },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex sm:flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
