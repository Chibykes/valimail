import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { AppRoutes } from "@/constants/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white px-4 py-5 md:w-56 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href={AppRoutes.HOME}
              className="font-[family-name:var(--font-display)] text-lg font-semibold text-teal-800"
            >
              Valimail
            </Link>
            <Suspense fallback={null}>
              <UserButton />
            </Suspense>
          </div>
          <SidebarNav />
        </aside>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
