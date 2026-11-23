"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { HeroShowcase } from "@/components/marketing/hero-showcase";
import type { ResultPanelData } from "@/components/shared/result-panel";
import { Button } from "@/components/ui/button";
import { HERO_TRUST_POINTS } from "@/constants/marketing";
import { AppRoutes } from "@/constants/routes";
import { EmailHelper } from "@/helpers/email";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { ReachableHelper } from "@/helpers/reachable";
import { ResultSignalsHelper } from "@/helpers/result-signals";
import { useCheckEmail } from "@/hooks/use-check-email";

export function HeroSection() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ResultPanelData | null>(null);
  const checkEmail = useCheckEmail();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = EmailHelper.normalize(email);
    if (!EmailHelper.isValidSyntax(normalized)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!isSignedIn) {
      const target = `${AppRoutes.DASHBOARD_SINGLE}?email=${encodeURIComponent(normalized)}`;
      router.push(`${AppRoutes.SIGN_UP}?redirect_url=${encodeURIComponent(target)}`);
      return;
    }

    try {
      const data = await checkEmail.mutateAsync({ email: normalized });
      setResult({
        email: data.email,
        status: data.isReachable,
        score: ReachableHelper.score(data.result),
        signals: ResultSignalsHelper.fromResult(data.result).slice(0, 5),
      });
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Validation failed"));
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-brand-200),transparent)] opacity-70 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Simple, fast and secure email validation
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            Clean lists.
            <br />
            Real users.{" "}
            <span className="relative inline-block text-brand-600">
              Zero bounces.
              <svg
                viewBox="0 0 300 18"
                className="absolute -bottom-2 left-0 w-full text-brand-300"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 13C60 4 140 2 298 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Remove fake, mistyped and disposable addresses before they hurt your
            deliverability. Check one email or an entire list in seconds.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-[0_12px_40px_-12px] shadow-brand-900/20 transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
          >
            <Mail className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email.address@company.com"
              className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
              aria-label="Email address to validate"
            />
            <Button
              type="submit"
              disabled={checkEmail.isPending}
              className="h-11 rounded-xl px-5 text-sm"
            >
              {checkEmail.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Validate <ArrowRight />
                </>
              )}
            </Button>
          </form>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {HERO_TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-500" strokeWidth={2.5} />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <HeroShowcase result={result} />
      </div>
    </section>
  );
}
