import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { ApiRoutes, AppRoutes } from "@/constants/routes";

const LINKS = [
  { href: AppRoutes.ADMIN, label: "Overview" },
  { href: AppRoutes.ADMIN_USERS, label: "Users" },
  { href: AppRoutes.ADMIN_JOBS, label: "Jobs" },
] as const;

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
          <div className="flex items-center justify-between sm:contents">
            <p className="font-display text-sm font-semibold">Valimail admin</p>
            <form action={ApiRoutes.ADMIN_LOGOUT} method="post" className="sm:order-last sm:ml-auto">
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Log out
              </button>
            </form>
          </div>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
