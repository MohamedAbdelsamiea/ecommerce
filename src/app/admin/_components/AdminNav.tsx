"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, LayoutDashboard, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { UserMenu } from "@/app/(store)/_components/UserMenu";

type UserData = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
] as const;

export function AdminNav({ user: _user }: { user: UserData | null }) {
  const pathname = usePathname();

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            CC
          </span>
          <span className="text-lg font-bold tracking-tight">CairoCart</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-200 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t flex justify-center">
        <UserMenu user={_user} dropUp adminMenu />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar trigger */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white hover:bg-muted transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            {sidebar}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col hidden lg:flex">
        {sidebar}
      </aside>
    </>
  );
}
