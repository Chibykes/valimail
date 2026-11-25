"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CREDIT_PLANS } from "@/constants/billing";
import { AppRoutes } from "@/constants/routes";
import { BillingHelper } from "@/helpers/billing";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useCheckout } from "@/hooks/use-billing";
import { cn } from "@/lib/utils";

export function PlanGrid() {
  const { isLoaded, isSignedIn } = useAuth();
  const checkout = useCheckout();
  const signInHref = `${AppRoutes.SIGN_IN}?redirect_url=${encodeURIComponent(AppRoutes.DASHBOARD_BILLING)}`;

  function buy(planId: string) {
    checkout.mutate(planId, {
      onError: (error) => {
        toast.error(ErrorMessageHelper.toMessage(error, "Couldn't start checkout"));
      },
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CREDIT_PLANS.map((plan) => {
        const featured = plan.discountPercent === 60;
        const pending = checkout.isPending && checkout.variables === plan.id;
        return (
          <article
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-background p-6 shadow-sm",
              featured ? "border-brand-300 ring-3 ring-brand-100" : "border-border",
            )}
          >
            <span
              className={cn(
                "mb-4 w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                plan.discountPercent > 0
                  ? "bg-brand-50 text-brand-700 ring-brand-600/15"
                  : "bg-muted text-muted-foreground ring-border",
              )}
            >
              {plan.discountPercent > 0 ? `${plan.discountPercent}% off` : "Base rate"}
            </span>
            <p className="font-display text-2xl font-semibold tracking-tight">
              {plan.credits.toLocaleString("en-US")} credits
            </p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {BillingHelper.formatPrice(plan.priceCents)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {BillingHelper.pricePerThousand(plan)} / 1,000
            </p>
            <div className="mt-6">
              {isLoaded && isSignedIn ? (
                <Button
                  className="h-10 w-full rounded-full"
                  disabled={checkout.isPending}
                  onClick={() => buy(plan.id)}
                >
                  {pending ? (
                    <>
                      <Loader2 className="animate-spin" /> Redirecting
                    </>
                  ) : (
                    "Buy credits"
                  )}
                </Button>
              ) : (
                <Button asChild className="h-10 w-full rounded-full" disabled={!isLoaded}>
                  <Link href={signInHref}>Buy credits</Link>
                </Button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
