"use client";

import { UserButton } from "@clerk/nextjs";
import { KeyRound, ListChecks, MailCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { DASHBOARD_NAV, DashboardNavKey } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  [DashboardNavKey.LISTS]: ListChecks,
  [DashboardNavKey.SINGLE]: MailCheck,
  [DashboardNavKey.API]: KeyRound,
} as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5">
        <Logo href={AppRoutes.DASHBOARD} />

        <nav className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {DASHBOARD_NAV.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4", active && "text-brand-600")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex justify-end">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
