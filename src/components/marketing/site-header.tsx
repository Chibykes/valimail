import { Show, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Suspense fallback={<div className="h-9 w-40" />}>
            <Show when="signed-out">
              <Button asChild variant="ghost" className="h-9 rounded-full px-4">
                <Link href={AppRoutes.SIGN_IN}>Sign in</Link>
              </Button>
              <Button
                asChild
                className="h-9 rounded-full px-4 shadow-[0_6px_20px_-6px] shadow-brand-600/60"
              >
                <Link href={AppRoutes.SIGN_UP}>
                  Get started <ArrowRight />
                </Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button asChild className="h-9 rounded-full px-4">
                <Link href={AppRoutes.DASHBOARD}>
                  Dashboard <ArrowRight />
                </Link>
              </Button>
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
