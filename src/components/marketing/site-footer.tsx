import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Brand } from "@/constants/brand";
import { MARKETING_NAV } from "@/constants/navigation";
import { AppRoutes } from "@/constants/routes";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {Brand.DESCRIPTION}
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Product</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {MARKETING_NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-foreground">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Account</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href={AppRoutes.SIGN_IN} className="hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link href={AppRoutes.SIGN_UP} className="hover:text-foreground">
                Create account
              </Link>
            </li>
            <li>
              <Link href={AppRoutes.DASHBOARD} className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href={AppRoutes.DOCS} className="hover:text-foreground">
                API docs
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {Brand.NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
