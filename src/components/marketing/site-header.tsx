import { Show, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { Button } from "@/components/ui/button";
import { MARKETING_NAV } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-5">
        <Logo />

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Suspense fallback={<div className="h-9 w-24" />}>
            <Show when="signed-out">
              <Button asChild variant="ghost" className="hidden h-9 rounded-full px-4 sm:inline-flex">
                <Link href={AppRoutes.SIGN_IN}>Sign in</Link>
              </Button>
              <Button
                asChild
                className="h-9 rounded-full px-3 shadow-[0_6px_20px_-6px] shadow-brand-600/60 sm:px-4"
              >
                <Link href={AppRoutes.SIGN_UP}>
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Get started</span>
                  <ArrowRight className="hidden sm:block" />
                </Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button asChild className="h-9 rounded-full px-3 sm:px-4">
                <Link href={AppRoutes.DASHBOARD}>
                  <span className="sm:hidden">App</span>
                  <span className="hidden sm:inline">Dashboard</span>
                  <ArrowRight className="hidden sm:block" />
                </Link>
              </Button>
              <UserButton />
            </Show>
          </Suspense>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
