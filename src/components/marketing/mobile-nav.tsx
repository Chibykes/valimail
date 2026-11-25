"use client";

import { Show } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MARKETING_NAV } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="grid size-9 place-items-center rounded-full text-foreground hover:bg-muted"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-background px-4 py-3 shadow-lg">
          <nav className="flex flex-col">
            {MARKETING_NAV.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <Show when="signed-out">
            <Link
              href={AppRoutes.SIGN_IN}
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              Sign in
            </Link>
          </Show>
        </div>
      ) : null}
    </div>
  );
}
