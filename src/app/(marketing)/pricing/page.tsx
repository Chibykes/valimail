import type { Metadata } from "next";
import { PlanGrid } from "@/components/billing/plan-grid";
import { Brand } from "@/constants/brand";

export const metadata: Metadata = {
  title: `Pricing — ${Brand.NAME}`,
  description: "Buy email validation credits. Larger packs cost less per thousand.",
};

export default function PricingPage() {
  return (
    <article className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">
        Pricing
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Credits for every address
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        One credit checks one email. A list costs one credit per valid address.
        The $5 pack is the base rate. Larger packs cost less per thousand.
      </p>
      <div className="mt-10">
        <PlanGrid />
      </div>
    </article>
  );
}
