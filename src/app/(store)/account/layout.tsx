import { requireAuth } from "@/lib/authorize";
import { AccountNav } from "./AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">My Account</h1>
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-48 shrink-0">
          <AccountNav />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
