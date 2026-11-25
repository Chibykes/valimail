import Link from "next/link";
import { useId } from "react";
import { Brand } from "@/constants/brand";
import { AppRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  const id = `vm-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={cn("size-8", className)}
    >
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path fill="oklch(0.99 0 0)" d="M14 17h10.4L32 36.5V50Z" />
      <path fill="oklch(0.72 0.17 158)" d="M50 17H39.6L32 36.5V50Z" />
      <defs>
        <linearGradient
          id={id}
          x1="8"
          y1="0"
          x2="56"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="oklch(0.62 0.2 264)" />
          <stop offset="1" stopColor="oklch(0.42 0.2 268)" />
        </linearGradient>
      </defs>
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
