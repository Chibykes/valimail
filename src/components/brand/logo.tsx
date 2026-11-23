import Link from "next/link";
import { Brand } from "@/constants/brand";
import { AppRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient id="vm-mark" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="oklch(0.62 0.2 264)" />
          <stop offset="1" stopColor="oklch(0.42 0.2 268)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#vm-mark)" />
      <path
        d="M8 11.5A1.5 1.5 0 0 1 9.5 10h13a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 20.5z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8.6 11 7.4 5.4 7.4-5.4"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="22" r="5" fill="oklch(0.72 0.17 158)" stroke="white" strokeWidth="1.6" />
      <path
        d="m20.8 22 1.5 1.5 2.9-3"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = AppRoutes.HOME,
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span className="font-display text-lg font-semibold text-foreground">
        {Brand.NAME}
      </span>
    </Link>
  );
}
