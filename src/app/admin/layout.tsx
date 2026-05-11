import type { Metadata } from "next";
import { requireAdmin } from "@/lib/authorize";
import { AdminNav } from "./_components/AdminNav";

export const metadata: Metadata = {
  title: {
    default: "Admin — CairoCart",
    template: "%s | Admin — CairoCart",
  },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <AdminNav
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          role: session.user.role ?? null,
        }}
      />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
