import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <Link
        href={AppRoutes.HOME}
        className="font-[family-name:var(--font-display)] text-xl tracking-tight text-slate-900"
      >
        Valimail
      </Link>

      <div className="flex items-center gap-2">
        <Suspense fallback={null}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
                Sign up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button asChild variant="ghost" size="sm">
              <Link href={AppRoutes.DASHBOARD_SINGLE}>Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </Suspense>
      </div>
    </header>
  );
}
