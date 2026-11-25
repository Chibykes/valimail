import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/constants/routes";

export function CtaSection() {
  return (
    <section className="px-5 pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-5 py-12 text-center text-white sm:px-8 sm:py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          aria-hidden
        />
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -top-16 -left-16 w-64 animate-float text-white/10"
          aria-hidden
        >
          <rect x="30" y="50" width="140" height="100" rx="14" fill="none" stroke="currentColor" strokeWidth="6" />
          <path d="M34 56 100 108 166 56" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        </svg>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Start sending to people who actually exist
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/75">
            Create an account and validate your first list in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="h-11 rounded-full bg-white px-6 text-brand-700 hover:bg-white/90"
            >
              <Link href={AppRoutes.SIGN_UP}>
                Create free account <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-11 rounded-full border border-white/25 px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={AppRoutes.SIGN_IN}>Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
