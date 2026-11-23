import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/constants/brand";
import { AppRoutes } from "@/constants/routes";

export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-800 via-brand-600 to-brand-800 text-white">
      <Link
        href={AppRoutes.SIGN_UP}
        className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-xs font-medium sm:text-[13px]"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-emerald-300" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
        </span>
        <span className="text-white/85">{Brand.ANNOUNCEMENT}</span>
        <span className="hidden text-white/40 sm:inline">·</span>
        <span className="hidden items-center gap-1 sm:inline-flex">
          {Brand.ANNOUNCEMENT_CTA}
          <ArrowRight className="size-3.5" />
        </span>
      </Link>
    </div>
  );
}
