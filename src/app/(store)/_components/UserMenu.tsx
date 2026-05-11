"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  ShoppingBag,
  LogOut,
  Menu,
  Shield,
  Package,
  ArrowLeft,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

type UserData = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function getInitials(user: UserData): string {
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return user.email?.[0]?.toUpperCase() ?? "?";
}

export function UserMenu({ user, dropUp, adminMenu }: { user: UserData | null; dropUp?: boolean; adminMenu?: boolean }) {
  return (
    <>
      <DesktopMenu user={user} dropUp={dropUp} adminMenu={adminMenu} />
      {!adminMenu && <MobileMenu user={user} adminMenu={adminMenu} />}
    </>
  );
}

function DesktopMenu({ user, dropUp, adminMenu }: { user: UserData | null; dropUp?: boolean; adminMenu?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const firstName = user.name?.split(" ")[0] || null;

  return (
    <div className={`relative ${adminMenu ? "block" : "hidden sm:block"}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:bg-muted transition-colors pr-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {getInitials(user)}
        </span>
        {firstName && (
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate max-w-[120px]">{firstName}</span>
        )}
      </button>
      {open && (
        <div className={`absolute z-50 w-48 rounded-xl border border-border bg-white p-1 shadow-lg ${
          dropUp ? "left-1/2 -translate-x-1/2 bottom-full mb-1" : "right-0 top-full mt-1"
        }`}>
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium truncate">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          {adminMenu && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
          )}
          <Link
            href="/account"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            My Account
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
            onClick={() => setOpen(false)}
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Link>
          {!adminMenu && user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Link>
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ user, adminMenu }: { user: UserData | null; adminMenu?: boolean }) {
  return (
    <div className="sm:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="p-6">
            {user ? (
              <div className="mb-6 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  {getInitials(user)}
                </div>
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            ) : null}
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                Home
              </Link>
              <Link
                href="/track-order"
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-4 w-4" />
                Track Order
              </Link>
              {user ? (
                <>
                  <div className="border-t border-border my-2" />
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                  </Link>
                  {adminMenu ? (
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Store
                    </Link>
                  ) : user.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  ) : null}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-border my-2" />
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors font-medium text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
