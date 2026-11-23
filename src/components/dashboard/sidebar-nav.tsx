"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, Mail } from "lucide-react";
import { AppRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: AppRoutes.DASHBOARD_SINGLE, label: "Single", icon: Mail },
  { href: AppRoutes.DASHBOARD_LISTS, label: "Lists", icon: ListChecks },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-teal-700 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
