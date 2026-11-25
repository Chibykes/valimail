"use client";

import { UserButton } from "@clerk/nextjs";
import { KeyRound, ListChecks, MailCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { DASHBOARD_NAV, DashboardNavKey } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";
import { useBillingAccount } from "@/hooks/use-billing";
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
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-5">
        <Logo href={AppRoutes.DASHBOARD} />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface p-1 md:flex">
          {DASHBOARD_NAV.map((item) => (
            <NavLink key={item.key} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <CreditBalance />
          <UserButton />
        </div>
      </div>
      <nav className="grid grid-cols-3 border-t border-border/70 md:hidden">
        {DASHBOARD_NAV.map((item) => (
          <NavLink key={item.key} item={item} pathname={pathname} compact />
        ))}
      </nav>
    </header>
  );
}

function NavLink({
  item,
  pathname,
  compact = false,
}: {
  item: (typeof DASHBOARD_NAV)[number];
  pathname: string;
  compact?: boolean;
}) {
  const Icon = NAV_ICONS[item.key];
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-center gap-1.5 font-medium transition-all",
        compact
          ? "px-2 py-2.5 text-xs"
          : "rounded-full px-3.5 py-1.5 text-sm",
        active
          ? compact
            ? "text-foreground"
            : "rounded-full bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground",
        compact && active && "bg-surface text-foreground",
      )}
    >
      <Icon className={cn("size-4", active && "text-brand-600")} />
      {item.label}
    </Link>
  );
}

function CreditBalance() {
  const { data } = useBillingAccount();
  const balance = data?.balance ?? 0;

  return (
    <Link
      href={AppRoutes.DASHBOARD_BILLING}
      className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium tabular-nums text-foreground transition-colors hover:border-brand-300 hover:text-brand-700 sm:px-3 sm:text-sm"
    >
      {balance.toLocaleString("en-US")}
      <span className="hidden sm:inline"> credits</span>
    </Link>
  );
}
