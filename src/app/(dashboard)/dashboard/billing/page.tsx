import { Suspense } from "react";
import {
  BalanceHeader,
  CheckoutNotice,
  CreditLedger,
} from "@/components/billing/billing-panel";
import { PlanGrid } from "@/components/billing/plan-grid";

export default function BillingPage() {
  return (
    <>
      <section className="relative border-b border-border/70 bg-surface">
        <div className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 py-10">
          <Suspense fallback={null}>
            <CheckoutNotice />
            <BalanceHeader />
          </Suspense>
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-12 px-5 py-10">
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">Buy credits</h2>
          <PlanGrid />
        </section>
        <CreditLedger />
      </div>
    </>
  );
}
