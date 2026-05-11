import Link from "next/link";
import { Suspense } from "react";
import { CartSheet } from "@/app/(store)/_components/CartSheet";
import { SearchBar } from "@/app/(store)/_components/SearchBar";
import { UserMenu } from "@/app/(store)/_components/UserMenu";
import { auth } from "@/lib/auth";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              CC
            </span>
            <span className="hidden sm:inline">CairoCart</span>
          </Link>

          <div className="flex-1 max-w-md mx-auto">
            <Suspense fallback={<div className="h-9 rounded-md bg-muted animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/track-order"
              className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              Track Order
            </Link>
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                Sign in
              </Link>
            )}
            <CartSheet />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">CairoCart</p>
          <p>&copy; 2026 CairoCart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
